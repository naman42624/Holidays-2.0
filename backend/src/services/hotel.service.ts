import { amadeusService } from './amadeus.service';
import { cacheService } from './cache.service';
import { HotelSearchParams, Hotel, ApiResponse } from '@/types/amadeus';
import axios, { AxiosError } from 'axios';

export class HotelService {
  // In-memory session cache for recent hotel searches
  private sessionCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly SESSION_CACHE_TTL = 20 * 60 * 1000; // 20 minutes (hotels change more frequently)
  private readonly MAX_SESSION_CACHE_SIZE = 500; // Conservative for hotel data
  
  // Request deduplication to prevent multiple identical API calls
  private pendingRequests = new Map<string, Promise<any>>();
  
  // Cost tracking
  private requestCount = 0;
  private cacheHits = 0;
  /**
   * Generate cache key for hotel searches
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
      console.log('💾 Hotel session cache hit:', key.substring(0, 50) + '...');
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
        .slice(0, 50); // Remove oldest 50 entries
      
      oldestEntries.forEach(([key]) => this.sessionCache.delete(key));
      console.log('🧹 Cleaned up hotel session cache, removed 50 old entries');
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

    try {
      // Use the cache service's generic methods
      const memoryCached = cacheService.get(key);
      if (memoryCached) {
        // Populate session cache with memory cache data for future fast access
        this.setInSessionCache(key, memoryCached);
        this.cacheHits++;
        console.log('💾 Hotel memory cache hit:', key.substring(0, 50) + '...');
        return memoryCached;
      }
    } catch (error) {
      console.warn('Memory cache error (continuing without cache):', error);
    }

    return null;
  }

  /**
   * Multi-layer cache: set in both session and memory cache
   */
  private async setInMultiLayerCache(key: string, data: any, sessionTtl: number = this.SESSION_CACHE_TTL, memoryTtl: number = 3600): Promise<void> {
    // Set in session cache
    this.setInSessionCache(key, data, sessionTtl);

    try {
      // Set in memory cache with longer TTL (persistent across requests)
      cacheService.set(key, data, memoryTtl);
    } catch (error) {
      console.warn('Memory cache set error (continuing without memory cache):', error);
    }
  }

  /**
   * Request deduplication to prevent multiple identical API calls
   */
  private async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if this exact request is already in progress
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Deduplicating request:', key.substring(0, 50) + '...');
      return await this.pendingRequests.get(key);
    }

    // Create new request
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
   * Handle API errors and return user-friendly error messages
   */
  private handleApiError(error: unknown, operation: string): never {
    console.error(`Hotel service error during ${operation}:`, error);
    
    // Handle timeout errors
    if (axios.isCancel(error)) {
      throw new Error(`Request timeout: The ${operation} request took too long to complete. Please try again later.`);
    }
    
    // Handle network errors
    if (error instanceof Error && error.message === 'Network Error') {
      throw new Error(`Network error: Unable to connect to hotel service. Please check your internet connection and try again.`);
    }
    
    // Handle Amadeus API errors
    if (error instanceof Error && error.name === 'AmadeusAPIError') {
      // Check for rate limit specific messages
      if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        throw new Error(`Service is temporarily busy. Please wait a moment and try your search again.`);
      }
      throw new Error(`Hotel service error: ${error.message}`);
    }
    
    // Handle Axios errors with response
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        
        if (statusCode === 400) {
          throw new Error(`Invalid request: Please check your search criteria and try again.`);
        } else if (statusCode === 401 || statusCode === 403) {
          throw new Error(`Authentication error: Unable to authenticate with the hotel service.`);
        } else if (statusCode === 404) {
          throw new Error(`No results: Could not find any hotels matching your search criteria.`);
        } else if (statusCode === 429) {
          throw new Error(`Service is temporarily busy due to high demand. Please wait a moment and try again.`);
        } else if (statusCode >= 500) {
          throw new Error(`Hotel service is currently unavailable. Please try again later.`);
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
   * Search for hotels by city with session caching and request deduplication
   */
  async searchHotelsByCity(params: HotelSearchParams): Promise<{
    data: Hotel[];
    meta: any;
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'citySearch',
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
        console.log('🏨 Fetching hotels from API for city:', params.cityCode);
        
        // For hotel locations by city, only use cityCode and radius
        const searchParams = {
          cityCode: params.cityCode,
          ...(params.radius && { radius: params.radius }),
          ...(params.radiusUnit && { radiusUnit: params.radiusUnit }),
          ...(params.hotelSource && { hotelSource: params.hotelSource }),
          ...(params.ratings && { ratings: params.ratings.join(',') }),
          ...(params.priceRange && { priceRange: params.priceRange }),
          ...(params.currency && { currency: params.currency }),
          ...(params.paymentPolicy && { paymentPolicy: params.paymentPolicy }),
          ...(params.boardType && { boardType: params.boardType }),
        };

        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: Hotel[];
            meta: any;
          }>('GET', '/v1/reference-data/locations/hotels/by-city', searchParams);
        });
      });
      
      // Cache the result in multi-layer cache
      await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 3600);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'hotel search by city');
    }
  }

  /**
   * Search for hotels by geocode (latitude/longitude) with session caching
   */
  async searchHotelsByGeocode(params: {
    latitude: number;
    longitude: number;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    radius?: number;
    radiusUnit?: 'KM' | 'MILE';
  }): Promise<{
    data: Hotel[];
    meta: any;
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'geocodeSearch',
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
        console.log('🏨 Fetching hotels from API for coordinates:', `${params.latitude},${params.longitude}`);
        
        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: Hotel[];
            meta: any;
          }>('GET', '/v1/reference-data/locations/hotels/by-geocode', params);
        });
      });
      
      // Cache the result in multi-layer cache
      await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 3600);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'hotel search by location');
    }
  }

  /**
   * Get hotel offers with pricing
   */
  async getHotelOffers(params: {
    hotelIds: string[];
    adults: number;
    checkInDate: string;
    checkOutDate: string;
    countryOfResidence?: string;
    roomQuantity?: number;
    priceRange?: string;
    currency?: string;
    paymentPolicy?: string;
    boardType?: string;
  }): Promise<{
    data: any[];
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'hotelOffers',
        ...params
      });
      
      // Check multi-layer cache first - hotel offers change frequently, shorter TTL
      const cached = await this.getFromMultiLayerCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use request deduplication for API calls
      const result = await this.deduplicateRequest(cacheKey, async () => {
        this.requestCount++;
        console.log('🏨 Fetching hotel offers from API for hotels:', params.hotelIds.slice(0, 3).join(','), '...');
        
        const searchParams = {
          hotelIds: params.hotelIds.join(','),
          adults: params.adults,
          checkInDate: params.checkInDate,
          checkOutDate: params.checkOutDate,
          ...(params.countryOfResidence && { countryOfResidence: params.countryOfResidence }),
          ...(params.roomQuantity && { roomQuantity: params.roomQuantity }),
          ...(params.priceRange && { priceRange: params.priceRange }),
          ...(params.currency && { currency: params.currency }),
          ...(params.paymentPolicy && { paymentPolicy: params.paymentPolicy }),
          ...(params.boardType && { boardType: params.boardType }),
        };

        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: any[];
          }>('GET', '/v3/shopping/hotel-offers', searchParams);
        });
      });
      
      // Cache with shorter TTL for pricing data (10 minutes)
      await this.setInMultiLayerCache(cacheKey, result, 10 * 60 * 1000, 600);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'getting hotel offers');
    }
  }

  /**
   * Get detailed hotel offer information
   */
  async getHotelOffer(offerId: string, lang?: string): Promise<{
    data: any;
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'hotelOffer',
        offerId,
        lang
      });
      
      // Check multi-layer cache first - offer details change frequently, shorter TTL
      const cached = await this.getFromMultiLayerCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use request deduplication for API calls
      const result = await this.deduplicateRequest(cacheKey, async () => {
        this.requestCount++;
        console.log('🏨 Fetching hotel offer details from API for offer ID:', offerId);
        
        const params = lang ? { lang } : undefined;
        
        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: any;
          }>('GET', `/v3/shopping/hotel-offers/${offerId}`, params);
        });
      });
      
      // Cache with shorter TTL for offer details (5 minutes)
      await this.setInMultiLayerCache(cacheKey, result, 5 * 60 * 1000, 300);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'retrieving hotel offer details');
    }
  }

  /**
   * Book a hotel
   */
  async bookHotel(bookingData: {
    data: {
      type: string;
      hotelOffers: any[];
      guests: any[];
      payments: any[];
    };
  }): Promise<{
    data: any;
  }> {
    try {
      // Booking operations can take longer, so use a 60 second timeout
      const result = await amadeusService.request<{
        data: any;
      }>('POST', '/v1/booking/hotel-bookings', undefined, bookingData, 60000);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'hotel booking');
    }
  }

  /**
   * Get hotel ratings and reviews
   */
  async getHotelRatings(params: {
    hotelIds: string[];
  }): Promise<{
    data: any[];
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'hotelRatings',
        ...params
      });
      
      // Check multi-layer cache first - ratings change less frequently, longer TTL
      const cached = await this.getFromMultiLayerCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use request deduplication for API calls
      const result = await this.deduplicateRequest(cacheKey, async () => {
        this.requestCount++;
        console.log('🏨 Fetching hotel ratings from API for hotels:', params.hotelIds.slice(0, 3).join(','), '...');
        
        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: any[];
          }>('GET', '/v2/e-reputation/hotel-sentiments', {
            hotelIds: params.hotelIds.join(','),
          });
        });
      });
      
      // Cache with longer TTL for ratings (1 hour)
      await this.setInMultiLayerCache(cacheKey, result, 60 * 60 * 1000, 3600);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'fetching hotel ratings');
    }
  }

  /**
   * Transform hotels for frontend consumption
   */
  transformHotels(hotels: any[]): any[] {
    return hotels.map(hotel => ({
      id: hotel.hotelId,
      name: hotel.name,
      chainCode: hotel.chainCode,
      iataCode: hotel.iataCode,
      dupeId: hotel.dupeId,
      location: {
        latitude: hotel.geoCode?.latitude,
        longitude: hotel.geoCode?.longitude,
        address: {
          lines: hotel.address?.lines || [],
          postalCode: hotel.address?.postalCode,
          city: hotel.address?.cityName,
          country: hotel.address?.countryCode,
          stateCode: hotel.address?.stateCode,
        },
      },
      masterChainCode: hotel.masterChainCode,
      lastUpdate: hotel.lastUpdate,
      // Add computed fields for better frontend experience
      rating: Math.floor(Math.random() * 2) + 4, // Random rating 4-5 for display
      amenities: ['WIFI', 'AC', 'PARKING'], // Default amenities
      contact: {
        phone: '+91-80-12345678', // Default phone for display
      },
      description: `${hotel.name} in ${hotel.address?.cityName || 'Bengaluru'}`,
      images: ['/api/placeholder/hotel.jpg'], // Placeholder image
    }));
  }

  /**
   * Transform hotel offers for frontend consumption
   */
  transformHotelOffers(offers: any[]): any[] {
    return offers.map(offer => ({
      id: offer.id,
      type: offer.type,
      hotel: {
        id: offer.hotel?.hotelId,
        name: offer.hotel?.name,
        rating: offer.hotel?.rating,
        location: offer.hotel?.address,
        contact: offer.hotel?.contact,
        description: offer.hotel?.description,
        amenities: offer.hotel?.amenities,
      },
      offers: offer.offers?.map((hotelOffer: any) => ({
        id: hotelOffer.id,
        checkInDate: hotelOffer.checkInDate,
        checkOutDate: hotelOffer.checkOutDate,
        roomQuantity: hotelOffer.roomQuantity,
        rateCode: hotelOffer.rateCode,
        price: {
          currency: hotelOffer.price?.currency,
          base: hotelOffer.price?.base,
          total: hotelOffer.price?.total,
          taxes: hotelOffer.price?.taxes,
        },
        room: {
          type: hotelOffer.room?.type,
          typeEstimated: hotelOffer.room?.typeEstimated,
          description: hotelOffer.room?.description?.text,
        },
        guests: hotelOffer.guests,
        paymentPolicy: hotelOffer.policies?.paymentPolicy,
        cancellationPolicy: hotelOffer.policies?.cancellation,
      })) || [],
    }));
  }

  /**
   * Cost optimization: Get cache and API usage statistics
   */
  getCostOptimizationStats(): {
    sessionCacheSize: number;
    cacheHitRate: number;
    totalRequests: number;
    cacheHits: number;
    memoryUsage: string;
    pendingRequests: number;
  } {
    const memoryUsage = process.memoryUsage();
    const totalOperations = this.requestCount + this.cacheHits;
    const cacheHitRate = totalOperations > 0 ? (this.cacheHits / totalOperations) * 100 : 0;
    
    return {
      sessionCacheSize: this.sessionCache.size,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      totalRequests: this.requestCount,
      cacheHits: this.cacheHits,
      memoryUsage: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      pendingRequests: this.pendingRequests.size
    };
  }

  /**
   * Cost optimization: Clear expired cache entries
   */
  clearExpiredSessionCache(): void {
    const now = Date.now();
    let clearedCount = 0;
    
    for (const [key, value] of this.sessionCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.sessionCache.delete(key);
        clearedCount++;
      }
    }
    
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired hotel cache entries`);
    }
  }

  /**
   * Initialize cost optimization features
   */
  initializeCostOptimizations(): void {
    // Clean expired cache entries every 10 minutes
    setInterval(() => {
      this.clearExpiredSessionCache();
    }, 10 * 60 * 1000);
    
    // Log cost optimization stats every hour
    setInterval(() => {
      const stats = this.getCostOptimizationStats();
      console.log('💰 Hotel Service Cost Stats:', stats);
    }, 60 * 60 * 1000);
    
    console.log('💰 Hotel service cost optimization features initialized');
  }
}

// Export singleton instance
export const hotelService = new HotelService();
