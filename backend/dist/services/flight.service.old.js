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
        console.log('💰 Flight service cost optimization features initialized');
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
        return await amadeus_service_1.amadeusService.request('POST', '/v1/shopping/flight-offers/pricing', undefined, requestData);
    }
    async createFlightOrder(bookingData) {
        const requestData = {
            data: {
                type: 'flight-order',
                ...bookingData,
            },
        };
        return await amadeus_service_1.amadeusService.request('POST', '/v1/booking/flight-orders', undefined, requestData);
    }
    async getFlightDestinations(params) {
        const searchParams = {
            origin: params.origin,
            ...(params.departureDate && { departureDate: params.departureDate }),
            ...(params.oneWay !== undefined && { oneWay: params.oneWay }),
            ...(params.duration && { duration: params.duration }),
            ...(params.nonStop !== undefined && { nonStop: params.nonStop }),
            ...(params.maxPrice && { maxPrice: params.maxPrice }),
            ...(params.viewBy && { viewBy: params.viewBy }),
        };
        return await amadeus_service_1.amadeusService.request('GET', '/v1/shopping/flight-destinations', searchParams);
    }
    async getFlightDates(params) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'flightDates',
                ...params
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('📅 Fetching flight dates from API for:', params.origin, '->', params.destination);
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', '/v1/shopping/flight-dates', params);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 14400);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'flight dates');
        }
    }
    async getAirlineInfo(airlineCodes) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'airlineInfo',
                codes: airlineCodes.sort()
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('🛫 Fetching airline info from API for:', airlineCodes.join(','));
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', '/v1/reference-data/airlines', {
                        airlineCodes: airlineCodes.join(','),
                    });
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 86400);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'airline information');
        }
    }
    async getAircraftInfo(aircraftCode) {
        try {
            const cacheKey = this.generateCacheKey({
                type: 'aircraftInfo',
                code: aircraftCode
            });
            const cached = await this.getFromMultiLayerCache(cacheKey);
            if (cached) {
                return cached;
            }
            const result = await this.deduplicateRequest(cacheKey, async () => {
                this.requestCount++;
                console.log('✈️ Fetching aircraft info from API for:', aircraftCode);
                return await this.retryWithBackoff(async () => {
                    return await amadeus_service_1.amadeusService.request('GET', `/v1/reference-data/aircraft/${aircraftCode}`);
                });
            });
            await this.setInMultiLayerCache(cacheKey, result, this.SESSION_CACHE_TTL, 86400);
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'aircraft information');
        }
    }
    applyMarkup(price, markupPercent = 2.5) {
        const originalPrice = parseFloat(price);
        const markup = originalPrice * (markupPercent / 100);
        const finalPrice = originalPrice + markup;
        return finalPrice.toFixed(2);
    }
    transformFlightOffers(flightOffers) {
        return flightOffers.map(offer => {
            const originalPrice = parseFloat(offer.price.total);
            const markedUpPrice = this.applyMarkup(offer.price.total);
            return {
                id: offer.id,
                price: {
                    total: markedUpPrice,
                    currency: offer.price.currency,
                    originalPrice: offer.price.total,
                    markup: '2.5%',
                },
                itineraries: offer.itineraries.map(itinerary => ({
                    duration: itinerary.duration,
                    segments: itinerary.segments.map(segment => ({
                        departure: {
                            iataCode: segment.departure.iataCode,
                            at: segment.departure.at,
                            terminal: segment.departure.terminal,
                        },
                        arrival: {
                            iataCode: segment.arrival.iataCode,
                            at: segment.arrival.at,
                            terminal: segment.arrival.terminal,
                        },
                        carrierCode: segment.carrierCode,
                        flightNumber: segment.number,
                        aircraft: {
                            code: segment.aircraft.code,
                        },
                        duration: segment.duration,
                    })),
                })),
                travelerPricings: offer.travelerPricings || [],
            };
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
exports.FlightService = FlightService;
exports.flightService = new FlightService();
//# sourceMappingURL=flight.service.old.js.map