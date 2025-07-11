import { LocationSearchParams, Location } from '@/types/amadeus';
export declare class LocationService {
    private sessionCache;
    private readonly SESSION_CACHE_TTL;
    private readonly MAX_SESSION_CACHE_SIZE;
    private pendingRequests;
    private requestCount;
    private cacheHits;
    private generateSessionCacheKey;
    private getFromSessionCache;
    private setInSessionCache;
    private getFromMultiLayerCache;
    private cacheInMultipleLayers;
    private handleApiError;
    private retryWithBackoff;
    searchLocations(params: LocationSearchParams): Promise<{
        data: Location[];
        meta: any;
    }>;
    getLocationDetails(locationId: string): Promise<{
        data: Location;
    }>;
    getAirportsByCity(cityCode: string): Promise<{
        data: Location[];
    }>;
    getCitiesByAirport(airportCode: string): Promise<{
        data: Location[];
    }>;
    getNearbyAirports(params: {
        latitude: number;
        longitude: number;
        radius?: number;
    }): Promise<{
        data: Location[];
    }>;
    transformLocations(locations: Location[]): any[];
    getPopularDestinations(params: {
        origin?: string;
        period?: string;
        max?: number;
    }): Promise<{
        data: any[];
    }>;
    getAirportInfo(airportCode: string): Promise<{
        data: any;
    }>;
    populatePopularDestinationsCache(): Promise<void>;
    schedulePopularDestinationsRefresh(): void;
    populateCacheGracefully(keywords: string[], batchSize?: number): Promise<void>;
    clearExpiredSessionCache(): void;
    getCostOptimizationStats(): {
        sessionCacheSize: number;
        cacheHitRate: number;
        totalRequests: number;
        cacheHits: number;
        memoryUsage: string;
        pendingRequests: number;
    };
    getCacheStats(): {
        sessionCacheSize: number;
        sessionCacheHitRate: number;
        memoryUsage: string;
    };
    initializeCostOptimizations(): void;
}
export declare const locationService: LocationService;
//# sourceMappingURL=location.service.d.ts.map