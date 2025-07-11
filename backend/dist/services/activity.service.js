"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityService = exports.ActivityService = void 0;
const amadeus_service_1 = require("./amadeus.service");
const cache_service_1 = require("./cache.service");
const axios_1 = __importDefault(require("axios"));
class ActivityService {
    constructor() {
        this.sessionCache = new Map();
        this.SESSION_CACHE_TTL = 60 * 60 * 1000;
        this.MAX_SESSION_CACHE_SIZE = 400;
        this.pendingRequests = new Map();
        this.requestCount = 0;
        this.cacheHits = 0;
        console.log('💰 Activity service cost optimization features initialized');
    }
    generateCacheKey(params) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
            result[key] = params[key];
            return result;
        }, {});
        return JSON.stringify(sortedParams).toLowerCase().replace(/\s+/g, '');
    }
    getFromSessionCache(key) {
        const cached = this.sessionCache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            this.cacheHits++;
            console.log('💾 Activity session cache hit:', key.substring(0, 50) + '...');
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
                .slice(0, 40);
            oldestEntries.forEach(([key]) => this.sessionCache.delete(key));
            console.log('🧹 Cleaned up activity session cache, removed 40 old entries');
        }
        this.sessionCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    async getFromMultiLayerCache(key) {
        const sessionCached = this.getFromSessionCache(key);
        if (sessionCached) {
            return sessionCached;
        }
        try {
            const persistentCached = await cache_service_1.cacheService.get(key);
            if (persistentCached) {
                console.log('💾 Activity persistent cache hit:', key.substring(0, 50) + '...');
                this.setInSessionCache(key, persistentCached, this.SESSION_CACHE_TTL);
                this.cacheHits++;
                return persistentCached;
            }
        }
        catch (error) {
            console.warn('⚠️ Persistent cache read error for activities:', error);
        }
        return null;
    }
    async setInMultiLayerCache(key, data, sessionTtl, persistentTtl) {
        this.setInSessionCache(key, data, sessionTtl);
        try {
            await cache_service_1.cacheService.set(key, data, persistentTtl);
        }
        catch (error) {
            console.warn('⚠️ Persistent cache write error for activities:', error);
        }
    }
    async deduplicateRequest(key, requestFn) {
        if (this.pendingRequests.has(key)) {
            console.log('🔄 Activity request deduplication:', key.substring(0, 50) + '...');
            return this.pendingRequests.get(key);
        }
        const requestPromise = requestFn();
        this.pendingRequests.set(key, requestPromise);
        try {
            const result = await requestPromise;
            return result;
        }
        finally {
            this.pendingRequests.delete(key);
        }
    }
    handleApiError(error, operation) {
        console.error(`Activity service error during ${operation}:`, error);
        if (error instanceof Error && error.message === 'Network Error') {
            throw new Error(`Network error: Unable to connect to activity service. Please check your internet connection and try again.`);
        }
        if (error instanceof Error && error.name === 'AmadeusAPIError') {
            if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
                throw new Error(`Service is temporarily busy. Please wait a moment and try your search again.`);
            }
            throw new Error(`Activity service error: ${error.message}`);
        }
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.response) {
                const statusCode = axiosError.response.status;
                if (statusCode === 400) {
                    throw new Error(`Invalid request: Please check your search criteria and try again.`);
                }
                else if (statusCode === 401 || statusCode === 403) {
                    throw new Error(`Authentication error: Unable to authenticate with the activity service.`);
                }
                else if (statusCode === 404) {
                    throw new Error(`No results: Could not find any activities matching your search criteria.`);
                }
                else if (statusCode === 429) {
                    throw new Error(`Service is temporarily busy due to high demand. Please wait a moment and try again.`);
                }
                else if (statusCode >= 500) {
                    throw new Error(`Activity service is currently unavailable. Please try again later.`);
                }
            }
            throw new Error(`Error during ${operation}: ${axiosError.message}`);
        }
        throw new Error(`Unexpected error during ${operation}. Please try again later.`);
    }
    async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                const isRateLimit = (error instanceof Error &&
                    (error.name === 'AmadeusAPIError' &&
                        (error.message.includes('rate limit') || error.message.includes('Rate limit')))) ||
                    (axios_1.default.isAxiosError(error) && error.response?.status === 429);
                if (isRateLimit && attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
                    console.log(`Rate limit encountered, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }
        throw new Error('Maximum retry attempts exceeded');
    }
    async searchActivities(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'activitySearch',
                ...params
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('🎪 Fetching activities from API');
                const searchParams = {};
                if (params.latitude && params.longitude) {
                    searchParams.latitude = params.latitude;
                    searchParams.longitude = params.longitude;
                    if (params.radius) {
                        searchParams.radius = params.radius;
                    }
                }
                else if (params.north && params.west && params.south && params.east) {
                    searchParams.north = params.north;
                    searchParams.west = params.west;
                    searchParams.south = params.south;
                    searchParams.east = params.east;
                }
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', '/v1/shopping/activities', searchParams);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 7200);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'activity search');
        }
    }
    async getActivityDetails(activityId) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'activityDetails',
                id: activityId
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('🎪 Fetching activity details from API for:', activityId);
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', `/v1/shopping/activities/${activityId}`);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 14400);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'activity details');
        }
    }
    async searchPointsOfInterest(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'pointsOfInterest',
                ...params
            });
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
                    return await amadeus_service_1.amadeusService.request('GET', '/v1/reference-data/locations/pois', searchParams);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 14400);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'points of interest search');
        }
    }
    async getPointsOfInterestBySquare(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'pointsOfInterestSquare',
                ...params
            });
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
                    return await amadeus_service_1.amadeusService.request('GET', '/v1/reference-data/locations/pois/by-square', searchParams);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 14400);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'points of interest by square search');
        }
    }
    async getPointOfInterestDetails(poiId) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'pointOfInterestDetails',
                id: poiId
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('📍 Fetching POI details from API for:', poiId);
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', `/v1/reference-data/locations/pois/${poiId}`);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 28800);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'point of interest details');
        }
    }
    transformActivities(activities) {
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
                amount: parseFloat(activity.price.amount) * 85 * 1.025,
                currency: 'INR',
            } : null,
            duration: {
                minimum: activity.minimumDuration,
                maximum: activity.maximumDuration,
            },
        }));
    }
    transformPointsOfInterest(pois) {
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
    getActivityCategories() {
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
    filterActivities(activities, filters) {
        return activities.filter(activity => {
            if (filters.minPrice && activity.price && activity.price.amount < filters.minPrice) {
                return false;
            }
            if (filters.maxPrice && activity.price && activity.price.amount > filters.maxPrice) {
                return false;
            }
            if (filters.minRating && activity.rating && activity.rating < filters.minRating) {
                return false;
            }
            if (filters.hasImages && (!activity.images || activity.images.length === 0)) {
                return false;
            }
            return true;
        });
    }
    getCostStats() {
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
exports.ActivityService = ActivityService;
exports.activityService = new ActivityService();
//# sourceMappingURL=activity.service.js.map