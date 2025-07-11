"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelService = exports.HotelService = void 0;
const amadeus_service_1 = require("./amadeus.service");
const cache_service_1 = require("./cache.service");
const axios_1 = __importDefault(require("axios"));
class HotelService {
    constructor() {
        this.sessionCache = new Map();
        this.SESSION_CACHE_TTL = 20 * 60 * 1000;
        this.MAX_SESSION_CACHE_SIZE = 500;
        this.pendingRequests = new Map();
        this.requestCount = 0;
        this.cacheHits = 0;
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
            console.log('💾 Hotel session cache hit:', key.substring(0, 50) + '...');
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
                .slice(0, 50);
            oldestEntries.forEach(([key]) => this.sessionCache.delete(key));
            console.log('🧹 Cleaned up hotel session cache, removed 50 old entries');
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
            const memoryCached = cache_service_1.cacheService.get(key);
            if (memoryCached) {
                this.setInSessionCache(key, memoryCached);
                this.cacheHits++;
                console.log('💾 Hotel memory cache hit:', key.substring(0, 50) + '...');
                return memoryCached;
            }
        }
        catch (error) {
            console.warn('Memory cache error (continuing without cache):', error);
        }
        return null;
    }
    async setInMultiLayerCache(key, data, sessionTtl = this.SESSION_CACHE_TTL, memoryTtl = 3600) {
        this.setInSessionCache(key, data, sessionTtl);
        try {
            cache_service_1.cacheService.set(key, data, memoryTtl);
        }
        catch (error) {
            console.warn('Memory cache set error (continuing without memory cache):', error);
        }
    }
    async deduplicateRequest(key, requestFn) {
        if (this.pendingRequests.has(key)) {
            console.log('🔄 Deduplicating request:', key.substring(0, 50) + '...');
            return await this.pendingRequests.get(key);
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
        console.error(`Hotel service error during ${operation}:`, error);
        if (axios_1.default.isCancel(error)) {
            throw new Error(`Request timeout: The ${operation} request took too long to complete. Please try again later.`);
        }
        if (error instanceof Error && error.message === 'Network Error') {
            throw new Error(`Network error: Unable to connect to hotel service. Please check your internet connection and try again.`);
        }
        if (error instanceof Error && error.name === 'AmadeusAPIError') {
            if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
                throw new Error(`Service is temporarily busy. Please wait a moment and try your search again.`);
            }
            throw new Error(`Hotel service error: ${error.message}`);
        }
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.response) {
                const statusCode = axiosError.response.status;
                if (statusCode === 400) {
                    throw new Error(`Invalid request: Please check your search criteria and try again.`);
                }
                else if (statusCode === 401 || statusCode === 403) {
                    throw new Error(`Authentication error: Unable to authenticate with the hotel service.`);
                }
                else if (statusCode === 404) {
                    throw new Error(`No results: Could not find any hotels matching your search criteria.`);
                }
                else if (statusCode === 429) {
                    throw new Error(`Service is temporarily busy due to high demand. Please wait a moment and try again.`);
                }
                else if (statusCode >= 500) {
                    throw new Error(`Hotel service is currently unavailable. Please try again later.`);
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
    async searchHotelsByCity(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'citySearch',
                ...params
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('🏨 Fetching hotels from API for city:', params.cityCode);
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
                    return await amadeus_service_1.amadeusService.request('GET', '/v1/reference-data/locations/hotels/by-city', searchParams);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 3600);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'hotel search by city');
        }
    }
    async searchHotelsByGeocode(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'geocodeSearch',
                ...params
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('🏨 Fetching hotels from API for coordinates:', `${params.latitude},${params.longitude}`);
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', '/v1/reference-data/locations/hotels/by-geocode', params);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 3600);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'hotel search by location');
        }
    }
    async getHotelOffers(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'hotelOffers',
                ...params
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
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
                    return await amadeus_service_1.amadeusService.request('GET', '/v3/shopping/hotel-offers', searchParams);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, 10 * 60 * 1000, 600);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'getting hotel offers');
        }
    }
    async getHotelOffer(offerId, lang) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'hotelOffer',
                offerId,
                lang
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('🏨 Fetching hotel offer details from API for offer ID:', offerId);
                const params = lang ? { lang } : undefined;
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', `/v3/shopping/hotel-offers/${offerId}`, params);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, 5 * 60 * 1000, 300);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'retrieving hotel offer details');
        }
    }
    async bookHotel(bookingData) {
        try {
            const result = await amadeus_service_1.amadeusService.request('POST', '/v1/booking/hotel-bookings', undefined, bookingData, 60000);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'hotel booking');
        }
    }
    async getHotelRatings(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'hotelRatings',
                ...params
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('🏨 Fetching hotel ratings from API for hotels:', params.hotelIds.slice(0, 3).join(','), '...');
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', '/v2/e-reputation/hotel-sentiments', {
                        hotelIds: params.hotelIds.join(','),
                    });
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, 60 * 60 * 1000, 3600);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'fetching hotel ratings');
        }
    }
    transformHotels(hotels) {
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
            rating: Math.floor(Math.random() * 2) + 4,
            amenities: ['WIFI', 'AC', 'PARKING'],
            contact: {
                phone: '+91-80-12345678',
            },
            description: `${hotel.name} in ${hotel.address?.cityName || 'Bengaluru'}`,
            images: ['/api/placeholder/hotel.jpg'],
        }));
    }
    transformHotelOffers(offers) {
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
            offers: offer.offers?.map((hotelOffer) => ({
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
            console.log(`🧹 Cleared ${clearedCount} expired hotel cache entries`);
        }
    }
    initializeCostOptimizations() {
        setInterval(() => {
            this.clearExpiredSessionCache();
        }, 10 * 60 * 1000);
        setInterval(() => {
            const stats = this.getCostOptimizationStats();
            console.log('💰 Hotel Service Cost Stats:', stats);
        }, 60 * 60 * 1000);
        console.log('💰 Hotel service cost optimization features initialized');
    }
}
exports.HotelService = HotelService;
exports.hotelService = new HotelService();
//# sourceMappingURL=hotel.service.js.map