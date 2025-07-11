import { FlightSearchParams, FlightOffer, BookingRequest, DestinationSearchParams, Destination } from '@/types/amadeus';
export declare class FlightService {
    private cache;
    private readonly CACHE_TTL;
    private readonly MAX_CACHE_SIZE;
    private pendingRequests;
    constructor();
    private generateCacheKey;
    private getFromCache;
    private setInCache;
    private cleanupCache;
    private deduplicateRequest;
    private handleApiError;
    private retryWithBackoff;
    searchFlightOffers(params: FlightSearchParams): Promise<{
        data: FlightOffer[];
        meta: any;
        dictionaries: any;
    }>;
    priceFlightOffers(flightOffers: FlightOffer[]): Promise<{
        data: {
            type: string;
            flightOffers: FlightOffer[];
        };
    }>;
    createFlightOrder(bookingData: BookingRequest): Promise<{
        data: any;
    }>;
    getFlightDestinations(params: DestinationSearchParams): Promise<{
        data: Destination[];
        meta: any;
    }>;
    getFlightDates(params: {
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
    }>;
    getAirlineInfo(airlineCodes: string[]): Promise<{
        data: any[];
    }>;
    getAircraftInfo(aircraftCode: string): Promise<{
        data: any;
    }>;
    private applyMarkup;
    transformFlightOffers(flightOffers: FlightOffer[]): any[];
    getCostStats(): {
        requestCount: number;
        cacheHits: number;
        cacheHitRate: string;
        sessionCacheSize: number;
    };
}
export declare const flightService: FlightService;
//# sourceMappingURL=flight.service.old.d.ts.map