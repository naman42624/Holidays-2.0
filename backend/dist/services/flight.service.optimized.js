"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightService = exports.FlightService = void 0;
const amadeus_service_1 = require("./amadeus.service");
const axios_1 = __importDefault(require("axios"));
class FlightService {
    constructor() {
        this.cache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
        this.MAX_CACHE_SIZE = 100;
        this.pendingRequests = new Map();
        console.log('💰 Flight service optimized for performance');
        setInterval(() => this.cleanupCache(), 60000);
    }
    generateCacheKey(params) {
        const key = `${params.originLocationCode}-${params.destinationLocationCode}-${params.departureDate}-${params.returnDate || 'oneway'}-${params.adults}-${params.children || 0}`;
        return key.toLowerCase();
    }
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            console.log('💾 Flight cache hit:', key);
            return cached.data;
        }
        if (cached) {
            this.cache.delete(key);
        }
        return null;
    }
    setInCache(key, data) {
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const keys = Array.from(this.cache.keys());
            const oldestKey = keys[0];
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    cleanupCache() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.CACHE_TTL) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired flight cache entries`);
        }
    }
    async deduplicateRequest(key, requestFn) {
        if (this.pendingRequests.has(key)) {
            console.log('🔄 Flight request deduplication:', key);
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
        console.error(`Flight service error during ${operation}:`, error);
        if (error instanceof Error && error.message === 'Network Error') {
            throw new Error(`Network error: Unable to connect to flight service. Please check your internet connection and try again.`);
        }
        if (error instanceof Error && error.name === 'AmadeusAPIError') {
            if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
                throw new Error(`Service is temporarily busy. Please wait a moment and try your search again.`);
            }
            throw new Error(`Flight service error: ${error.message}`);
        }
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.response) {
                const statusCode = axiosError.response.status;
                if (statusCode === 400) {
                    throw new Error(`Invalid request: Please check your search criteria and try again.`);
                }
                else if (statusCode === 401 || statusCode === 403) {
                    throw new Error(`Authentication error: Unable to authenticate with the flight service.`);
                }
                else if (statusCode === 404) {
                    throw new Error(`No results: Could not find any flights matching your search criteria.`);
                }
                else if (statusCode === 429) {
                    throw new Error(`Service is temporarily busy due to high demand. Please wait a moment and try again.`);
                }
                else if (statusCode >= 500) {
                    throw new Error(`Flight service is currently unavailable. Please try again later.`);
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
    async searchFlightOffers(params) {
        try {
            const cacheKey = this.generateCacheKey(params);
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                console.log('✈️ Fetching flight offers from API:', params.originLocationCode, '->', params.destinationLocationCode);
                const searchParams = {
                    originLocationCode: params.originLocationCode,
                    destinationLocationCode: params.destinationLocationCode,
                    departureDate: params.departureDate,
                    ...(params.returnDate && { returnDate: params.returnDate }),
                    adults: params.adults,
                    ...(params.children && { children: params.children }),
                    ...(params.infants && { infants: params.infants }),
                    max: params.max || 10,
                    ...(params.currencyCode && { currencyCode: params.currencyCode }),
                    ...(params.nonStop !== undefined && { nonStop: params.nonStop }),
                    ...(params.travelClass && { travelClass: params.travelClass }),
                };
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', '/v2/shopping/flight-offers', searchParams);
                });
            });
            this.setInCache(cacheKey, result);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'flight search');
        }
    }
    async priceFlightOffers(flightOffers) {
        const requestData = {
            data: {
                type: 'flight-offers-pricing',
                flightOffers,
            },
        };
        return await amadeus_service_1.amadeusService.request('POST', '/v1/shopping/flight-offers/pricing', requestData);
    }
    async bookFlight(bookingRequest) {
        return await amadeus_service_1.amadeusService.request('POST', '/v1/booking/flight-orders', bookingRequest);
    }
    async searchDestinations(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'destinations',
                ...params
            });
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                console.log('✈️ Fetching destinations from API for:', params.origin);
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', '/v1/shopping/flight-destinations', params);
                });
            });
            this.setInCache(cacheKey, result);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'destination search');
        }
    }
    async getFlightInspiration(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'inspiration',
                ...params
            });
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                console.log('✈️ Fetching flight inspiration from API for:', params.origin);
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', '/v1/shopping/flight-dates', params);
                });
            });
            this.setInCache(cacheKey, result);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'flight inspiration');
        }
    }
    getStats() {
        return {
            cacheSize: this.cache.size,
            pendingRequests: this.pendingRequests.size,
            maxCacheSize: this.MAX_CACHE_SIZE,
            cacheTTL: this.CACHE_TTL
        };
    }
}
exports.FlightService = FlightService;
exports.flightService = new FlightService();
//# sourceMappingURL=flight.service.optimized.js.map