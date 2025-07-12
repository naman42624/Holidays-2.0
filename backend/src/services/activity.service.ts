import { amadeusService } from './amadeus.service';
import { cacheService } from './cache.service';
import { ActivitySearchParams, Activity } from '@/types/amadeus';
import axios, { AxiosError } from 'axios';

export class ActivityService {
  // In-memory session cache for recent activity searches
  private sessionCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly SESSION_CACHE_TTL = 60 * 60 * 1000; // 1 hour (activities are more stable than flights)
  private readonly MAX_SESSION_CACHE_SIZE = 400; // Good size for activity data
  
  // Request deduplication to prevent multiple identical API calls
  private pendingRequests = new Map<string, Promise<any>>();
  
  // Cost tracking
  private requestCount = 0;
  private cacheHits = 0;

  constructor() {
    console.log('💰 Activity service cost optimization features initialized');
  }

  /**
   * Generate cache key for activity searches
   */
  private generateCacheKey(params: any): string {
    // Sort and stringify for consistent keys
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as any);
    
    return JSON.stringify(sortedParams).toLowerCase().replace(/\s+/g, '');
  }

  /**
   * Get from session cache
   */
  private getFromSessionCache(key: string): any | null {
    const cached = this.sessionCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.cacheHits++;
      console.log('💾 Activity session cache hit:', key.substring(0, 50) + '...');
      return cached.data;
    }
    
    // Remove expired entry
    if (cached) {
      this.sessionCache.delete(key);
    }
    
    return null;
  }

  /**
   * Set in session cache with size management
   */
  private setInSessionCache(key: string, data: any, ttl: number = this.SESSION_CACHE_TTL): void {
    // Clean up old entries if cache is getting too large
    if (this.sessionCache.size >= this.MAX_SESSION_CACHE_SIZE) {
      const oldestEntries = Array.from(this.sessionCache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)
        .slice(0, 40); // Remove oldest 40 entries
      
      oldestEntries.forEach(([key]) => this.sessionCache.delete(key));
      console.log('🧹 Cleaned up activity session cache, removed 40 old entries');
    }

    this.sessionCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Multi-layer cache: check session cache first, then persistent cache
   */
  private async getFromMultiLayerCache(key: string): Promise<any | null> {
    // First, check session cache (fastest)
    const sessionCached = this.getFromSessionCache(key);
    if (sessionCached) {
      return sessionCached;
    }

    // Then check persistent cache (slower but persistent across restarts)
    try {
      const persistentCached = await cacheService.get(key);
      if (persistentCached) {
        console.log('💾 Activity persistent cache hit:', key.substring(0, 50) + '...');
        // Also store in session cache for faster future access
        this.setInSessionCache(key, persistentCached, this.SESSION_CACHE_TTL);
        this.cacheHits++;
        return persistentCached;
      }
    } catch (error) {
      console.warn('⚠️ Persistent cache read error for activities:', error);
    }

    return null;
  }

  /**
   * Set in multi-layer cache
   */
  private async setInMultiLayerCache(key: string, data: any, sessionTtl: number, persistentTtl: number): Promise<void> {
    // Store in session cache
    this.setInSessionCache(key, data, sessionTtl);

    // Store in persistent cache
    try {
      await cacheService.set(key, data, persistentTtl);
    } catch (error) {
      console.warn('⚠️ Persistent cache write error for activities:', error);
    }
  }

  /**
   * Request deduplication: prevent multiple identical requests
   */
  private async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If same request is already pending, return that promise
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Activity request deduplication:', key.substring(0, 50) + '...');
      return this.pendingRequests.get(key);
    }

    // Execute the request and cache the promise
    const requestPromise = requestFn();
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the pending request
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleApiError(error: any, operation: string): never {
    console.error(`Activity service error during ${operation}:`, error);

    // Handle network errors
    if (error instanceof Error && error.message === 'Network Error') {
      throw new Error(`Network error: Unable to connect to activity service. Please check your internet connection and try again.`);
    }
    
    // Handle Amadeus API errors
    if (error instanceof Error && error.name === 'AmadeusAPIError') {
      // Check for rate limit specific messages
      if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        throw new Error(`Service is temporarily busy. Please wait a moment and try your search again.`);
      }
      throw new Error(`Activity service error: ${error.message}`);
    }
    
    // Handle Axios errors with response
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        
        if (statusCode === 400) {
          throw new Error(`Invalid request: Please check your search criteria and try again.`);
        } else if (statusCode === 401 || statusCode === 403) {
          throw new Error(`Authentication error: Unable to authenticate with the activity service.`);
        } else if (statusCode === 404) {
          throw new Error(`No results: Could not find any activities matching your search criteria.`);
        } else if (statusCode === 429) {
          throw new Error(`Service is temporarily busy due to high demand. Please wait a moment and try again.`);
        } else if (statusCode >= 500) {
          throw new Error(`Activity service is currently unavailable. Please try again later.`);
        }
      }
      
      throw new Error(`Error during ${operation}: ${axiosError.message}`);
    }

    // Handle any other errors
    throw new Error(`Unexpected error during ${operation}. Please try again later.`);
  }

  /**
   * Retry API calls with exponential backoff for rate limiting
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const isRateLimit = (error instanceof Error && 
          (error.name === 'AmadeusAPIError' && 
           (error.message.includes('rate limit') || error.message.includes('Rate limit')))) ||
          (axios.isAxiosError(error) && error.response?.status === 429);

        if (isRateLimit && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000; // Add jitter
          console.log(`Rate limit encountered, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('Maximum retry attempts exceeded');
  }
  /**
   * Search for tours and activities
   */
  async searchActivities(params: ActivitySearchParams): Promise<{
    data: Activity[];
    meta: any;
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'activitySearch',
        ...params
      });
      
      // Check multi-layer cache first
      const cached = await this.getFromMultiLayerCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use request deduplication for API calls
      const result = await this.deduplicateRequest(cacheKey, async () => {
        this.requestCount++;
        console.log('🎪 Fetching activities from API');
        
        const searchParams: any = {};

        // Use either radius search or bounding box search
        if (params.latitude && params.longitude) {
          searchParams.latitude = params.latitude;
          searchParams.longitude = params.longitude;
          if (params.radius) {
            searchParams.radius = params.radius;
          }
        } else if (params.north && params.west && params.south && params.east) {
          searchParams.north = params.north;
          searchParams.west = params.west;
          searchParams.south = params.south;
          searchParams.east = params.east;
        }

        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: Activity[];
            meta: any;
          }>('GET', '/v1/shopping/activities', searchParams);
        });
      });
      
      // Cache the result in multi-layer cache (activities are relatively stable)
      await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 7200); // 1 hour session, 2 hours persistent
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'activity search');
    }
  }

  /**
   * Get detailed activity information
   */
  async getActivityDetails(activityId: string): Promise<{
    data: Activity;
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'activityDetails',
        id: activityId
      });
      
      // Check multi-layer cache first
      const cached = await this.getFromMultiLayerCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.deduplicateRequest(cacheKey, async () => {
        this.requestCount++;
        console.log('🎪 Fetching activity details from API for:', activityId);
        
        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: Activity;
          }>('GET', `/v1/shopping/activities/${activityId}`);
        });
      });
      
      // Cache activity details for longer (they're relatively stable)
      await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 14400); // 4 hours persistent
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'activity details');
    }
  }

  /**
   * Search for points of interest
   */
  async searchPointsOfInterest(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    categories?: string[];
  }): Promise<{
    data: any[];
    meta: any;
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'pointsOfInterest',
        ...params
      });
      
      // Check multi-layer cache first
      const cached = await this.getFromMultiLayerCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.deduplicateRequest(cacheKey, async () => {
        this.requestCount++;
        console.log('📍 Fetching points of interest from API');
        
        const searchParams = {
          latitude: params.latitude,
          longitude: params.longitude,
          ...(params.radius && { radius: params.radius }),
          ...(params.categories && { categories: params.categories.join(',') }),
        };

        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: any[];
            meta: any;
          }>('GET', '/v1/reference-data/locations/pois', searchParams);
        });
      });
      
      // Cache POIs for 4 hours (relatively stable)
      await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 14400);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'points of interest search');
    }
  }

  /**
   * Get points of interest by square area
   */
  async getPointsOfInterestBySquare(params: {
    north: number;
    west: number;
    south: number;
    east: number;
    categories?: string[];
  }): Promise<{
    data: any[];
    meta: any;
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'pointsOfInterestSquare',
        ...params
      });
      
      // Check multi-layer cache first
      const cached = await this.getFromMultiLayerCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.deduplicateRequest(cacheKey, async () => {
        this.requestCount++;
        console.log('📍 Fetching POIs by square from API');
        
        const searchParams = {
          north: params.north,
          west: params.west,
          south: params.south,
          east: params.east,
          ...(params.categories && { categories: params.categories.join(',') }),
        };

        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: any[];
            meta: any;
          }>('GET', '/v1/reference-data/locations/pois/by-square', searchParams);
        });
      });
      
      // Cache POIs for 4 hours (relatively stable)
      await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 14400);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'points of interest by square search');
    }
  }

  /**
   * Get detailed point of interest information
   */
  async getPointOfInterestDetails(poiId: string): Promise<{
    data: any;
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'pointOfInterestDetails',
        id: poiId
      });
      
      // Check multi-layer cache first
      const cached = await this.getFromMultiLayerCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.deduplicateRequest(cacheKey, async () => {
        this.requestCount++;
        console.log('📍 Fetching POI details from API for:', poiId);
        
        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: any;
          }>('GET', `/v1/reference-data/locations/pois/${poiId}`);
        });
      });
      
      // Cache POI details for 8 hours (very stable)
      await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 28800);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'point of interest details');
    }
  }

  /**
   * Transform activities for frontend consumption
   */
  transformActivities(activities: Activity[]): any[] {
    return activities.map(activity => ({
      id: activity.id,
      name: activity.name,
      shortDescription: activity.shortDescription,
      description: activity.description,
      location: {
        latitude: activity.geoCode?.latitude,
        longitude: activity.geoCode?.longitude,
      },
      rating: activity.rating ? parseFloat(activity.rating) : null,
      images: activity.pictures || [],
      bookingLink: activity.bookingLink,
      price: activity.price ? {
        amount: parseFloat(activity.price.amount) * 85, // Convert to INR with no markup
        currency: 'INR',
      } : null,
      duration: {
        minimum: activity.minimumDuration,
        maximum: activity.maximumDuration,
      },
    }));
  }

  /**
   * Transform points of interest for frontend consumption
   */
  transformPointsOfInterest(pois: any[]): any[] {
    return pois.map(poi => ({
      id: poi.id,
      name: poi.name,
      category: poi.category,
      subCategory: poi.subCategory,
      location: {
        latitude: poi.geoCode?.latitude,
        longitude: poi.geoCode?.longitude,
      },
      address: poi.address,
      tags: poi.tags || [],
      rank: poi.rank,
      wikipedia: poi.wikipedia?.link,
    }));
  }

  /**
   * Get activity categories
   */
  getActivityCategories(): string[] {
    return [
      'SIGHTSEEING',
      'BEACH_PARK',
      'HISTORICAL',
      'MUSEUM',
      'RELIGIOUS',
      'SHOPPING',
      'NIGHTLIFE',
      'RESTAURANT',
      'OUTDOOR',
      'ADVENTURE',
      'ENTERTAINMENT',
      'SPORTS',
      'WELLNESS',
      'FAMILY',
    ];
  }

  /**
   * Filter activities by criteria
   */
  filterActivities(activities: any[], filters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    categories?: string[];
    hasImages?: boolean;
  }): any[] {
    return activities.filter(activity => {
      // Price filter
      if (filters.minPrice && activity.price && activity.price.amount < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && activity.price && activity.price.amount > filters.maxPrice) {
        return false;
      }

      // Rating filter
      if (filters.minRating && activity.rating && activity.rating < filters.minRating) {
        return false;
      }

      // Images filter
      if (filters.hasImages && (!activity.images || activity.images.length === 0)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get cost and performance statistics
   */
  getCostStats(): {
    requestCount: number;
    cacheHits: number;
    cacheHitRate: string;
    sessionCacheSize: number;
  } {
    const cacheHitRate = this.requestCount > 0 
      ? ((this.cacheHits / (this.requestCount + this.cacheHits)) * 100).toFixed(1)
      : '0.0';

    return {
      requestCount: this.requestCount,
      cacheHits: this.cacheHits,
      cacheHitRate: `${cacheHitRate}%`,
      sessionCacheSize: this.sessionCache.size,
    };
  }
}

export const activityService = new ActivityService();
