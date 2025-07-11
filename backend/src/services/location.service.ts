import { amadeusService } from './amadeus.service';
import { cacheService } from './cache.service';
import { LocationSearchParams, Location } from '@/types/amadeus';

export class LocationService {
  // In-memory session cache for recent searches (reduces Redis calls too)
  private sessionCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly SESSION_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_SESSION_CACHE_SIZE = 1000; // Prevent memory bloat
  
  // Request deduplication to prevent multiple identical API calls
  private pendingRequests = new Map<string, Promise<any>>();
  
  // Cost tracking
  private requestCount = 0;
  private cacheHits = 0;

  /**
   * Generate cache key for session storage
   */
  private generateSessionCacheKey(params: any): string {
    return JSON.stringify(params).toLowerCase().replace(/\s+/g, '');
  }

  /**
   * Get from session cache
   */
  private getFromSessionCache(key: string): any | null {
    const cached = this.sessionCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.cacheHits++;
      console.log('💾 Session cache hit:', key.substring(0, 50) + '...');
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
        .slice(0, 100); // Remove oldest 100 entries
      
      oldestEntries.forEach(([key]) => this.sessionCache.delete(key));
      console.log('🧹 Cleaned up session cache, removed 100 old entries');
    }

    this.sessionCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Enhanced cache lookup with multiple layers
   */
  private async getFromMultiLayerCache(params: LocationSearchParams): Promise<any | null> {
    const sessionKey = this.generateSessionCacheKey(params);
    
    // Layer 1: Session cache (fastest, in-memory)
    const sessionResult = this.getFromSessionCache(sessionKey);
    if (sessionResult) {
      return sessionResult;
    }

    // Layer 2: Redis cache (fast, persistent)
    if (params.keyword) {
      const cachedResult = await cacheService.getCachedLocation(params.keyword, params);
      if (cachedResult) {
        this.cacheHits++;
        console.log('🚀 Redis cache hit for location search:', params.keyword);
        // Store in session cache for even faster future access
        this.setInSessionCache(sessionKey, {
          data: cachedResult,
          meta: { fromCache: true, layer: 'redis' }
        });
        return {
          data: cachedResult,
          meta: { fromCache: true, layer: 'redis' }
        };
      }
    }

    return null;
  }

  /**
   * Cache result in multiple layers
   */
  private async cacheInMultipleLayers(params: LocationSearchParams, result: any): Promise<void> {
    const sessionKey = this.generateSessionCacheKey(params);
    
    // Cache in session (immediate future requests)
    this.setInSessionCache(sessionKey, result);
    
    // Cache in Redis (persistent across sessions)
    if (params.keyword && result.data && result.data.length > 0) {
      await cacheService.setCachedLocation(params.keyword, params, result.data, result.meta);
    }
  }
  /**
   * Handle API errors and return user-friendly error messages
   */
  private handleApiError(error: unknown, operation: string): never {
    console.error(`Location service error during ${operation}:`, error);
    
    // Handle Amadeus API errors
    if (error instanceof Error && error.name === 'AmadeusAPIError') {
      // Check for rate limit specific messages
      if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        throw new Error(`Location search is temporarily busy. Please wait a moment and try again.`);
      }
      throw new Error(`Location service error: ${error.message}`);
    }
    
    // Handle other errors
    if (error instanceof Error) {
      throw new Error(`Error during ${operation}: ${error.message}`);
    }
    
    throw new Error(`Unexpected error during ${operation}. Please try again later.`);
  }

  /**
   * Retry API calls with exponential backoff for rate limiting
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 2000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`🔄 Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If it's a rate limit error and we have retries left, continue
        if (lastError.message.includes('rate limit') && attempt < maxRetries) {
          console.log(`⏳ Rate limit hit, waiting before retry...`);
          continue;
        }
        
        // If it's not a rate limit error or we're out of retries, throw
        throw lastError;
      }
    }
    
    throw lastError!;
  }
  /**
   * Search for airports, cities, and locations with enhanced multi-layer caching
   */
  async searchLocations(params: LocationSearchParams): Promise<{
    data: Location[];
    meta: any;
  }> {
    try {
      // Try multi-layer cache first
      const cachedResult = await this.getFromMultiLayerCache(params);
      if (cachedResult) {
        return cachedResult;
      }

      console.log('🔍 Cache miss for location search, fetching from API:', params.keyword);
      
      this.requestCount++;
      
      const searchParams = {
        keyword: params.keyword,
        subType: params.subType || 'AIRPORT,CITY',
        ...(params.countryCode && { countryCode: params.countryCode }),
        ...(params.view && { view: params.view }),
        ...(params.sort && { sort: params.sort }),
        'page[limit]': params.page?.limit || 10,
        ...(params.page?.offset && { 'page[offset]': params.page.offset }),
      };

      const result = await this.retryWithBackoff(async () => {
        return await amadeusService.request<{
          data: Location[];
          meta: any;
        }>('GET', '/v1/reference-data/locations', searchParams);
      });

      // Cache the result in multiple layers
      await this.cacheInMultipleLayers(params, result);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'location search');
    }
  }

  /**
   * Get detailed information about a specific location with aggressive caching
   */
  async getLocationDetails(locationId: string): Promise<{
    data: Location;
  }> {
    try {
      const cacheKey = `location_details_${locationId}`;
      
      // Check session cache first
      const cached = this.getFromSessionCache(cacheKey);
      if (cached) {
        return cached;
      }

      this.requestCount++;

      const result = await this.retryWithBackoff(async () => {
        return await amadeusService.request<{
          data: Location;
        }>('GET', `/v1/reference-data/locations/${locationId}`);
      });

      // Cache for longer since location details rarely change
      this.setInSessionCache(cacheKey, result, 2 * 60 * 60 * 1000); // 2 hours
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'getting location details');
    }
  }

  /**
   * Get airports in a city with caching
   */
  async getAirportsByCity(cityCode: string): Promise<{
    data: Location[];
  }> {
    try {
      const cacheKey = `airports_by_city_${cityCode.toLowerCase()}`;
      
      // Check session cache first
      const cached = this.getFromSessionCache(cacheKey);
      if (cached) {
        return cached;
      }

      this.requestCount++;

      const result = await this.retryWithBackoff(async () => {
        return await amadeusService.request<{
          data: Location[];
        }>('GET', '/v1/reference-data/locations', {
          keyword: cityCode,
          subType: 'AIRPORT',
        });
      });

      // Cache for 1 hour (airports don't change often)
      this.setInSessionCache(cacheKey, result, 60 * 60 * 1000);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'getting airports by city');
    }
  }

  /**
   * Get cities served by an airport with caching
   */
  async getCitiesByAirport(airportCode: string): Promise<{
    data: Location[];
  }> {
    try {
      const cacheKey = `cities_by_airport_${airportCode.toLowerCase()}`;
      
      // Check session cache first
      const cached = this.getFromSessionCache(cacheKey);
      if (cached) {
        return cached;
      }

      this.requestCount++;

      const result = await this.retryWithBackoff(async () => {
        return await amadeusService.request<{
          data: Location[];
        }>('GET', `/v1/reference-data/locations/${airportCode}`);
      });

      // Cache for 2 hours (airport-city relationships are stable)
      this.setInSessionCache(cacheKey, result, 2 * 60 * 60 * 1000);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'getting cities by airport');
    }
  }

  /**
   * Get nearby airports with intelligent caching (rounded coordinates)
   */
  async getNearbyAirports(params: {
    latitude: number;
    longitude: number;
    radius?: number;
  }): Promise<{
    data: Location[];
  }> {
    try {
      // Round coordinates to reduce cache variations (e.g., 40.7589 becomes 40.76)
      const roundedLat = Math.round(params.latitude * 100) / 100;
      const roundedLng = Math.round(params.longitude * 100) / 100;
      const radius = params.radius || 100;
      
      const cacheKey = `nearby_airports_${roundedLat}_${roundedLng}_${radius}`;
      
      // Check session cache first
      const cached = this.getFromSessionCache(cacheKey);
      if (cached) {
        return cached;
      }

      this.requestCount++;

      const result = await this.retryWithBackoff(async () => {
        return await amadeusService.request<{
          data: Location[];
        }>('GET', '/v1/reference-data/locations/airports', {
          latitude: params.latitude,
          longitude: params.longitude,
          radius: radius,
        });
      });

      // Cache for 6 hours (airports don't move!)
      this.setInSessionCache(cacheKey, result, 6 * 60 * 60 * 1000);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'getting nearby airports');
    }
  }

  /**
   * Transform locations for frontend consumption
   */
  transformLocations(locations: Location[]): any[] {
    return locations.map(location => ({
      id: location.id,
      name: location.name,
      detailedName: location.detailedName,
      type: location.subType,
      iataCode: location.iataCode,
      city: location.address?.cityName,
      cityCode: location.address?.cityCode,
      country: location.address?.countryName,
      countryCode: location.address?.countryCode,
      coordinates: {
        latitude: location.geoCode?.latitude,
        longitude: location.geoCode?.longitude,
      },
      timeZone: location.timeZoneOffset,
      relevanceScore: location.analytics?.travelers?.score,
    }));
  }

  /**
   * Get popular destinations
   */
  async getPopularDestinations(params: {
    origin?: string;
    period?: string;
    max?: number;
  }): Promise<{
    data: any[];
  }> {
    try {
      const searchParams = {
        ...(params.origin && { origin: params.origin }),
        ...(params.period && { period: params.period }),
        ...(params.max && { max: params.max }),
      };

      this.requestCount++;

      return await this.retryWithBackoff(async () => {
        return await amadeusService.request<{
          data: any[];
        }>('GET', '/v1/travel/analytics/fare-searches', searchParams);
      });
    } catch (error) {
      throw this.handleApiError(error, 'getting popular destinations');
    }
  }

  /**
   * Get airport information with additional details
   */
  async getAirportInfo(airportCode: string): Promise<{
    data: any;
  }> {
    try {
      this.requestCount++;
      
      return await this.retryWithBackoff(async () => {
        return await amadeusService.request<{
          data: any;
        }>('GET', `/v1/reference-data/locations/${airportCode}`);
      });
    } catch (error) {
      throw this.handleApiError(error, 'getting airport information');
    }
  }

  /**
   * Cost optimization: Populate cache with popular destinations - run this strategically
   */
  async populatePopularDestinationsCache(): Promise<void> {
    console.log('🔄 Starting cost-optimized cache population...');
    
    // Reduced list focusing on most popular destinations only
    const topDestinations = [
      'New York', 'London', 'Paris', 'Tokyo', 'Los Angeles', 
      'Chicago', 'Miami', 'San Francisco', 'Seattle',
      'NYC', 'LON', 'PAR', 'TYO', 'LAX', 'CHI', 'MIA', 'SFO', 'SEA'
    ];

    try {
      // Use very conservative batching to minimize API costs
      await this.populateCacheGracefully(topDestinations, 2); // Smaller batches
      console.log('🎉 Cost-optimized cache population completed!');
    } catch (error) {
      console.error('❌ Error during cache population:', error);
    }
  }

  /**
   * Cost optimization: Schedule cache refresh less frequently
   */
  schedulePopularDestinationsRefresh(): void {
    console.log('📅 Scheduling cost-optimized cache refresh...');
    
    // Only run cache population in production during off-peak hours
    if (process.env.NODE_ENV === 'production') {
      // Run at 3 AM daily (off-peak hours, lower API costs)
      const now = new Date();
      const nextRun = new Date(now);
      nextRun.setHours(3, 0, 0, 0);
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      const timeToNextRun = nextRun.getTime() - now.getTime();
      
      setTimeout(() => {
        this.populatePopularDestinationsCache();
        
        // Then run every 24 hours
        setInterval(() => {
          this.populatePopularDestinationsCache();
        }, 24 * 60 * 60 * 1000);
      }, timeToNextRun);
      
      console.log(`📅 Next cache refresh scheduled for: ${nextRun.toISOString()}`);
    } else {
      // In development, run after 10 minutes with reduced frequency
      setTimeout(() => {
        this.populatePopularDestinationsCache();
      }, 10 * 60 * 1000);
      
      console.log('📅 Development mode: Cache refresh in 10 minutes');
    }
  }

  /**
   * Cost optimization: Ultra-conservative cache population
   */
  async populateCacheGracefully(keywords: string[], batchSize: number = 2): Promise<void> {
    console.log(`🔄 Starting ultra-conservative cache population for ${keywords.length} keywords...`);
    
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      console.log(`📦 Processing mini-batch ${Math.floor(i / batchSize) + 1}: ${batch.join(', ')}`);
      
      for (const keyword of batch) {
        try {
          // Check if already cached to avoid unnecessary API calls
          const existing = await this.getFromMultiLayerCache({
            keyword,
            subType: 'AIRPORT,CITY',
            page: { limit: 10 }
          });
          
          if (existing) {
            console.log(`⚡ Already cached: "${keyword}"`);
            continue;
          }

          const result = await this.searchLocations({
            keyword,
            subType: 'AIRPORT,CITY',
            page: { limit: 10 } // Reduced limit to save costs
          });
          
          if (result.data && result.data.length > 0) {
            console.log(`✅ Cached ${result.data.length} locations for "${keyword}"`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to cache "${keyword}":`, error instanceof Error ? error.message : 'Unknown');
          
          // On any error, wait extra long to avoid costs
          if (error instanceof Error && error.message.includes('rate limit')) {
            console.log('⏳ Rate limit hit, waiting 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000));
          }
        }
        
        // Longer delays to minimize API costs
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds between requests
      }
      
      // Longer waits between batches
      if (i + batchSize < keywords.length) {
        console.log('⏸️ Waiting 30 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
    
    console.log('✨ Ultra-conservative cache population completed!');
  }

  /**
   * Cost optimization: Clear old cache entries to prevent memory bloat
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
      console.log(`🧹 Cleared ${clearedCount} expired session cache entries`);
    }
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
   * Cost optimization: Get cache statistics for monitoring (legacy method)
   */
  getCacheStats(): {
    sessionCacheSize: number;
    sessionCacheHitRate: number;
    memoryUsage: string;
  } {
    const stats = this.getCostOptimizationStats();
    
    return {
      sessionCacheSize: stats.sessionCacheSize,
      sessionCacheHitRate: stats.cacheHitRate,
      memoryUsage: stats.memoryUsage
    };
  }

  /**
   * Initialize cost optimization features
   */
  initializeCostOptimizations(): void {
    // Clean expired cache entries every 15 minutes
    setInterval(() => {
      this.clearExpiredSessionCache();
    }, 15 * 60 * 1000);
    
    console.log('💰 Cost optimization features initialized');
  }
}

export const locationService = new LocationService();
