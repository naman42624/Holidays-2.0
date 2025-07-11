"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationService = exports.LocationService = void 0;
const amadeus_service_1 = require("./amadeus.service");
const cache_service_1 = require("./cache.service");
class LocationService {
    constructor() {
        this.sessionCache = new Map();
        this.SESSION_CACHE_TTL = 30 * 60 * 1000;
        this.MAX_SESSION_CACHE_SIZE = 1000;
        this.pendingRequests = new Map();
        this.requestCount = 0;
        this.cacheHits = 0;
    }
    generateSessionCacheKey(params) {
        return JSON.stringify(params).toLowerCase().replace(/\s+/g, '');
    }
    getFromSessionCache(key) {
        const cached = this.sessionCache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            this.cacheHits++;
            console.log('💾 Session cache hit:', key.substring(0, 50) + '...');
            return cached.data;
        }
        if (cached) {
            this.sessionCache.delete(key);
        }
        return null;
    }
    setInSessionCache(key, data, ttl = this.SESSION_CACHE_TTL) {
        if (this.sessionCache.size >= this.MAX_SESSION_CACHE_SIZE) {
            const oldestEntries = Array.from(this.sessionCache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)
                .slice(0, 100);
            oldestEntries.forEach(([key]) => this.sessionCache.delete(key));
            console.log('🧹 Cleaned up session cache, removed 100 old entries');
        }
        this.sessionCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    async getFromMultiLayerCache(params) {
        const sessionKey = this.generateSessionCacheKey(params);
        const sessionResult = this.getFromSessionCache(sessionKey);
        if (sessionResult) {
            return sessionResult;
        }
        if (params.keyword) {
            const cachedResult = await cache_service_1.cacheService.getCachedLocation(params.keyword, params);
            if (cachedResult) {
                this.cacheHits++;
                console.log('🚀 Redis cache hit for location search:', params.keyword);
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
    async cacheInMultipleLayers(params, result) {
        const sessionKey = this.generateSessionCacheKey(params);
        this.setInSessionCache(sessionKey, result);
        if (params.keyword && result.data && result.data.length > 0) {
            await cache_service_1.cacheService.setCachedLocation(params.keyword, params, result.data, result.meta);
        }
    }
    handleApiError(error, operation) {
        console.error(`Location service error during ${operation}:`, error);
        if (error instanceof Error && error.name === 'AmadeusAPIError') {
            if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
                throw new Error(`Location search is temporarily busy. Please wait a moment and try again.`);
            }
            throw new Error(`Location service error: ${error.message}`);
        }
        if (error instanceof Error) {
            throw new Error(`Error during ${operation}: ${error.message}`);
        }
        throw new Error(`Unexpected error during ${operation}. Please try again later.`);
    }
    async retryWithBackoff(operation, maxRetries = 3, baseDelay = 2000) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = baseDelay * Math.pow(2, attempt - 1);
                    console.log(`🔄 Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                if (lastError.message.includes('rate limit') && attempt < maxRetries) {
                    console.log(`⏳ Rate limit hit, waiting before retry...`);
                    continue;
                }
                throw lastError;
            }
        }
        throw lastError;
    }
    async searchLocations(params) {
        try {
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
                return await amadeus_service_1.amadeusService.request('GET', '/v1/reference-data/locations', searchParams);
            });
            await this.cacheInMultipleLayers(params, result);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'location search');
        }
    }
    async getLocationDetails(locationId) {
        try {
            const cacheKey = `location_details_${locationId}`;
            const cached = this.getFromSessionCache(cacheKey);
            if (cached) {
                return cached;
            }
            this.requestCount++;
            const result = await this.retryWithBackoff(async () => {
                return await amadeus_service_1.amadeusService.request('GET', `/v1/reference-data/locations/${locationId}`);
            });
            this.setInSessionCache(cacheKey, result, 2 * 60 * 60 * 1000);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'getting location details');
        }
    }
    async getAirportsByCity(cityCode) {
        try {
            const cacheKey = `airports_by_city_${cityCode.toLowerCase()}`;
            const cached = this.getFromSessionCache(cacheKey);
            if (cached) {
                return cached;
            }
            this.requestCount++;
            const result = await this.retryWithBackoff(async () => {
                return await amadeus_service_1.amadeusService.request('GET', '/v1/reference-data/locations', {
                    keyword: cityCode,
                    subType: 'AIRPORT',
                });
            });
            this.setInSessionCache(cacheKey, result, 60 * 60 * 1000);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'getting airports by city');
        }
    }
    async getCitiesByAirport(airportCode) {
        try {
            const cacheKey = `cities_by_airport_${airportCode.toLowerCase()}`;
            const cached = this.getFromSessionCache(cacheKey);
            if (cached) {
                return cached;
            }
            this.requestCount++;
            const result = await this.retryWithBackoff(async () => {
                return await amadeus_service_1.amadeusService.request('GET', `/v1/reference-data/locations/${airportCode}`);
            });
            this.setInSessionCache(cacheKey, result, 2 * 60 * 60 * 1000);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'getting cities by airport');
        }
    }
    async getNearbyAirports(params) {
        try {
            const roundedLat = Math.round(params.latitude * 100) / 100;
            const roundedLng = Math.round(params.longitude * 100) / 100;
            const radius = params.radius || 100;
            const cacheKey = `nearby_airports_${roundedLat}_${roundedLng}_${radius}`;
            const cached = this.getFromSessionCache(cacheKey);
            if (cached) {
                return cached;
            }
            this.requestCount++;
            const result = await this.retryWithBackoff(async () => {
                return await amadeus_service_1.amadeusService.request('GET', '/v1/reference-data/locations/airports', {
                    latitude: params.latitude,
                    longitude: params.longitude,
                    radius: radius,
                });
            });
            this.setInSessionCache(cacheKey, result, 6 * 60 * 60 * 1000);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'getting nearby airports');
        }
    }
    transformLocations(locations) {
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
    async getPopularDestinations(params) {
        try {
            const searchParams = {
                ...(params.origin && { origin: params.origin }),
                ...(params.period && { period: params.period }),
                ...(params.max && { max: params.max }),
            };
            this.requestCount++;
            return await this.retryWithBackoff(async () => {
                return await amadeus_service_1.amadeusService.request('GET', '/v1/travel/analytics/fare-searches', searchParams);
            });
        }
        catch (error) {
            throw this.handleApiError(error, 'getting popular destinations');
        }
    }
    async getAirportInfo(airportCode) {
        try {
            this.requestCount++;
            return await this.retryWithBackoff(async () => {
                return await amadeus_service_1.amadeusService.request('GET', `/v1/reference-data/locations/${airportCode}`);
            });
        }
        catch (error) {
            throw this.handleApiError(error, 'getting airport information');
        }
    }
    async populatePopularDestinationsCache() {
        console.log('🔄 Starting cost-optimized cache population...');
        const topDestinations = [
            'New York', 'London', 'Paris', 'Tokyo', 'Los Angeles',
            'Chicago', 'Miami', 'San Francisco', 'Seattle',
            'NYC', 'LON', 'PAR', 'TYO', 'LAX', 'CHI', 'MIA', 'SFO', 'SEA'
        ];
        try {
            await this.populateCacheGracefully(topDestinations, 2);
            console.log('🎉 Cost-optimized cache population completed!');
        }
        catch (error) {
            console.error('❌ Error during cache population:', error);
        }
    }
    schedulePopularDestinationsRefresh() {
        console.log('📅 Scheduling cost-optimized cache refresh...');
        if (process.env.NODE_ENV === 'production') {
            const now = new Date();
            const nextRun = new Date(now);
            nextRun.setHours(3, 0, 0, 0);
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
            const timeToNextRun = nextRun.getTime() - now.getTime();
            setTimeout(() => {
                this.populatePopularDestinationsCache();
                setInterval(() => {
                    this.populatePopularDestinationsCache();
                }, 24 * 60 * 60 * 1000);
            }, timeToNextRun);
            console.log(`📅 Next cache refresh scheduled for: ${nextRun.toISOString()}`);
        }
        else {
            setTimeout(() => {
                this.populatePopularDestinationsCache();
            }, 10 * 60 * 1000);
            console.log('📅 Development mode: Cache refresh in 10 minutes');
        }
    }
    async populateCacheGracefully(keywords, batchSize = 2) {
        console.log(`🔄 Starting ultra-conservative cache population for ${keywords.length} keywords...`);
        for (let i = 0; i < keywords.length; i += batchSize) {
            const batch = keywords.slice(i, i + batchSize);
            console.log(`📦 Processing mini-batch ${Math.floor(i / batchSize) + 1}: ${batch.join(', ')}`);
            for (const keyword of batch) {
                try {
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
                        page: { limit: 10 }
                    });
                    if (result.data && result.data.length > 0) {
                        console.log(`✅ Cached ${result.data.length} locations for "${keyword}"`);
                    }
                }
                catch (error) {
                    console.warn(`⚠️ Failed to cache "${keyword}":`, error instanceof Error ? error.message : 'Unknown');
                    if (error instanceof Error && error.message.includes('rate limit')) {
                        console.log('⏳ Rate limit hit, waiting 60 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 60000));
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            if (i + batchSize < keywords.length) {
                console.log('⏸️ Waiting 30 seconds before next batch...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }
        console.log('✨ Ultra-conservative cache population completed!');
    }
    clearExpiredSessionCache() {
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
    getCostOptimizationStats() {
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
    getCacheStats() {
        const stats = this.getCostOptimizationStats();
        return {
            sessionCacheSize: stats.sessionCacheSize,
            sessionCacheHitRate: stats.cacheHitRate,
            memoryUsage: stats.memoryUsage
        };
    }
    initializeCostOptimizations() {
        setInterval(() => {
            this.clearExpiredSessionCache();
        }, 15 * 60 * 1000);
        console.log('💰 Cost optimization features initialized');
    }
}
exports.LocationService = LocationService;
exports.locationService = new LocationService();
//# sourceMappingURL=location.service.js.map