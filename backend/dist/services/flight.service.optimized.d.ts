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
    bookFlight(bookingRequest: BookingRequest): Promise<any>;
    searchDestinations(params: DestinationSearchParams): Promise<{
        data: Destination[];
        meta: any;
    }>;
    getFlightInspiration(params: {
        origin: string;
        maxPrice?: number;
        departureDate?: string;
    }): Promise<{
        data: any[];
        meta: any;
    }>;
    getStats(): object;
}
export declare const flightService: FlightService;
//# sourceMappingURL=flight.service.optimized.d.ts.map