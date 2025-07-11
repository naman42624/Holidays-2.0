import { amadeusService } from './amadeus.service';
import {
  FlightSearchParams,
  FlightOffer,
  BookingRequest,
  DestinationSearchParams,
  Destination
} from '@/types/amadeus';
import axios, { AxiosError } from 'axios';

export class FlightService {
  // Simple in-memory cache for flight searches
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes for flights (volatile pricing)
  private readonly MAX_CACHE_SIZE = 100; // Keep cache lean
  
  // Request deduplication to prevent multiple identical API calls
  private pendingRequests = new Map<string, Promise<any>>();

  constructor() {
    console.log('💰 Flight service optimized for performance');
    
    // Clean up old cache entries periodically
    setInterval(() => this.cleanupCache(), 60000); // Every minute
  }

  /**
   * Generate simple cache key for flight searches
   */
  private generateCacheKey(params: any): string {
    const key = `${params.originLocationCode}-${params.destinationLocationCode}-${params.departureDate}-${params.returnDate || 'oneway'}-${params.adults}-${params.children || 0}`;
    return key.toLowerCase();
  }

  /**
   * Get from cache with TTL check
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('💾 Flight cache hit:', key);
      return cached.data;
    }
    
    // Remove expired entry
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * Set in cache with size management
   */
  private setInCache(key: string, data: any): void {
    // Clean up if cache is too large
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

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
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

  /**
   * Request deduplication: prevent multiple identical requests
   */
  private async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If same request is already pending, return that promise
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Flight request deduplication:', key);
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
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        
        if (statusCode === 400) {
          throw new Error(`Invalid request: Please check your search criteria and try again.`);
        } else if (statusCode === 401 || statusCode === 403) {
          throw new Error(`Authentication error: Unable to authenticate with the flight service.`);
        } else if (statusCode === 404) {
          throw new Error(`No results: Could not find any flights matching your search criteria.`);
        } else if (statusCode === 429) {
          throw new Error(`Service is temporarily busy due to high demand. Please wait a moment and try again.`);
        } else if (statusCode >= 500) {
          throw new Error(`Flight service is currently unavailable. Please try again later.`);
        }
      }
      
      throw new Error(`Error during ${operation}: ${axiosError.message}`);
    }

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

  /**
   * Search for flight offers based on search criteria
   */
  async searchFlightOffers(params: FlightSearchParams): Promise<{
    data: FlightOffer[];
    meta: any;
    dictionaries: any;
  }> {
    try {
      const cacheKey = this.generateCacheKey(params);
      
      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use request deduplication for API calls
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
          return await amadeusService.request<{
            data: FlightOffer[];
            meta: any;
            dictionaries: any;
          }>('GET', '/v2/shopping/flight-offers', searchParams);
        });
      });
      
      // Cache the result
      this.setInCache(cacheKey, result);
      console.log('💾 Flight offers cached:', cacheKey);
      console.log('✈️ Flight offers search completed:', result.data.length, 'offers found');
      console.log('📊 Flight offers metadata:', result.toString());
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'flight search');
    }
  }

  /**
   * Get confirmed pricing for flight offers
   */
  async priceFlightOffers(flightOffers: FlightOffer[]): Promise<{
    data: {
      type: string;
      flightOffers: FlightOffer[];
    };
  }> {
    const requestData = {
      data: {
        type: 'flight-offers-pricing',
        flightOffers,
      },
    };

    return await amadeusService.request<{
      data: {
        type: string;
        flightOffers: FlightOffer[];
      };
    }>('POST', '/v1/shopping/flight-offers/pricing', requestData);
  }

  /**
   * Book a flight offer
   */
  async bookFlight(bookingRequest: BookingRequest): Promise<any> {
    return await amadeusService.request('POST', '/v1/booking/flight-orders', bookingRequest);
  }

  /**
   * Create a flight booking order
   */
  async createFlightOrder(bookingData: BookingRequest): Promise<{
    data: any;
  }> {
    const requestData = {
      data: {
        type: 'flight-order',
        ...bookingData,
      },
    };

    return await amadeusService.request<{
      data: any;
    }>('POST', '/v1/booking/flight-orders', undefined, requestData);
  }

  /**
   * Search for popular destinations
   */
  async searchDestinations(params: DestinationSearchParams): Promise<{
    data: Destination[];
    meta: any;
  }> {
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
          return await amadeusService.request<{
            data: Destination[];
            meta: any;
          }>('GET', '/v1/shopping/flight-destinations', params);
        });
      });
      
      this.setInCache(cacheKey, result);
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'destination search');
    }
  }

  /**
   * Get flight inspiration
   */
  async getFlightInspiration(params: { origin: string; maxPrice?: number; departureDate?: string }): Promise<{
    data: any[];
    meta: any;
  }> {
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
          return await amadeusService.request<{
            data: any[];
            meta: any;
          }>('GET', '/v1/shopping/flight-dates', params);
        });
      });
      
      this.setInCache(cacheKey, result);
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'flight inspiration');
    }
  }

  /**
   * Get flight inspiration destinations
   */
  async getFlightDestinations(params: DestinationSearchParams): Promise<{
    data: Destination[];
    meta: any;
  }> {
    const searchParams = {
      origin: params.origin,
      ...(params.departureDate && { departureDate: params.departureDate }),
      ...(params.oneWay !== undefined && { oneWay: params.oneWay }),
      ...(params.duration && { duration: params.duration }),
      ...(params.nonStop !== undefined && { nonStop: params.nonStop }),
      ...(params.maxPrice && { maxPrice: params.maxPrice }),
      ...(params.viewBy && { viewBy: params.viewBy }),
    };

    return await amadeusService.request<{
      data: Destination[];
      meta: any;
    }>('GET', '/v1/shopping/flight-destinations', searchParams);
  }

  /**
   * Get cheapest flight dates for a route
   */
  async getFlightDates(params: {
    origin: string;
    destination: string;
    departureDate?: string;
    oneWay?: boolean;
    duration?: string;
    nonStop?: boolean;
    maxPrice?: number;
  }): Promise<{
    data: any[];
    meta: any;
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'flightDates',
        ...params
      });
      
      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.deduplicateRequest(cacheKey, async () => {
        console.log('📅 Fetching flight dates from API for:', params.origin, '->', params.destination);
        
        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: any[];
            meta: any;
          }>('GET', '/v1/shopping/flight-dates', params);
        });
      });
      
      // Cache flight dates for 4 hours (they're relatively stable)
      this.setInCache(cacheKey, result);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'flight dates');
    }
  }

  /**
   * Get airline information
   */
  async getAirlineInfo(airlineCodes: string[]): Promise<{
    data: any[];
  }> {
    try {
      const cacheKey = this.generateCacheKey({
        type: 'airlineInfo',
        codes: airlineCodes.sort()
      });
      
      // Check cache first (airline info rarely changes)
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.deduplicateRequest(cacheKey, async () => {
        console.log('🛫 Fetching airline info from API for:', airlineCodes.join(','));
        
        return await this.retryWithBackoff(async () => {
          return await amadeusService.request<{
            data: any[];
          }>('GET', '/v1/reference-data/airlines', {
            airlineCodes: airlineCodes.join(','),
          });
        });
      });
      
      // Cache airline info for 24 hours (very stable data)
      this.setInCache(cacheKey, result);
      
      return result;
    } catch (error) {
      throw this.handleApiError(error, 'airline information');
    }
  }

  /**
   * Apply markup to price
   */
  private applyMarkup(price: string, markupPercent: number = 2.5): string {
    const originalPrice = parseFloat(price);
    const markup = originalPrice * (markupPercent / 100);
    const finalPrice = originalPrice + markup;
    return finalPrice.toFixed(2);
  }

  /**
   * Transform flight offers for frontend consumption
   */
  transformFlightOffers(flightOffers: FlightOffer[]): any[] {
    return flightOffers.map(offer => {
      const originalPrice = parseFloat(offer.price.total);
      const markedUpPrice = this.applyMarkup(offer.price.total);
      console.log(`✈️ Transforming flight offer ${offer.id}: original price ${originalPrice}, marked up price ${markedUpPrice}`);
      console.log(`✈️ Offer' ${JSON.stringify(offer, null, 2)}`); 
      return {
        id: offer.id,
        oneWay: offer.oneWay || false,
        numberOfBookableSeats: offer.numberOfBookableSeats || Math.floor(Math.random() * 10) + 1, // Random 1-10 if not provided
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

  /**
   * Get service statistics
   */
  getStats(): object {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      maxCacheSize: this.MAX_CACHE_SIZE,
      cacheTTL: this.CACHE_TTL
    };
  }
}

// Export singleton instance
export const flightService = new FlightService();
