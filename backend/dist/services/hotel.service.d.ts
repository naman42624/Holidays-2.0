import { HotelSearchParams, Hotel } from '@/types/amadeus';
export declare class HotelService {
    private sessionCache;
    private readonly SESSION_CACHE_TTL;
    private readonly MAX_SESSION_CACHE_SIZE;
    private pendingRequests;
    private requestCount;
    private cacheHits;
    private generateCacheKey;
    private getFromSessionCache;
    private setInSessionCache;
    private getFromMultiLayerCache;
    private setInMultiLayerCache;
    private deduplicateRequest;
    private handleApiError;
    private retryWithBackoff;
    searchHotelsByCity(params: HotelSearchParams): Promise<{
        data: Hotel[];
        meta: any;
    }>;
    searchHotelsByGeocode(params: {
        latitude: number;
        longitude: number;
        checkInDate: string;
        checkOutDate: string;
        adults: number;
        radius?: number;
        radiusUnit?: 'KM' | 'MILE';
    }): Promise<{
        data: Hotel[];
        meta: any;
    }>;
    getHotelOffers(params: {
        hotelIds: string[];
        adults: number;
        checkInDate: string;
        checkOutDate: string;
        countryOfResidence?: string;
        roomQuantity?: number;
        priceRange?: string;
        currency?: string;
        paymentPolicy?: string;
        boardType?: string;
    }): Promise<{
        data: any[];
    }>;
    getHotelOffer(offerId: string, lang?: string): Promise<{
        data: any;
    }>;
    bookHotel(bookingData: {
        data: {
            type: string;
            hotelOffers: any[];
            guests: any[];
            payments: any[];
        };
    }): Promise<{
        data: any;
    }>;
    getHotelRatings(params: {
        hotelIds: string[];
    }): Promise<{
        data: any[];
    }>;
    transformHotels(hotels: any[]): any[];
    transformHotelOffers(offers: any[]): any[];
    getCostOptimizationStats(): {
        sessionCacheSize: number;
        cacheHitRate: number;
        totalRequests: number;
        cacheHits: number;
        memoryUsage: string;
        pendingRequests: number;
    };
    clearExpiredSessionCache(): void;
    initializeCostOptimizations(): void;
}
export declare const hotelService: HotelService;
//# sourceMappingURL=hotel.service.d.ts.map