import { ActivitySearchParams, Activity } from '@/types/amadeus';
export declare class ActivityService {
    private sessionCache;
    private readonly SESSION_CACHE_TTL;
    private readonly MAX_SESSION_CACHE_SIZE;
    private pendingRequests;
    private requestCount;
    private cacheHits;
    constructor();
    private generateCacheKey;
    private getFromSessionCache;
    private setInSessionCache;
    private getFromMultiLayerCache;
    private setInMultiLayerCache;
    private deduplicateRequest;
    private handleApiError;
    private retryWithBackoff;
    searchActivities(params: ActivitySearchParams): Promise<{
        data: Activity[];
        meta: any;
    }>;
    getActivityDetails(activityId: string): Promise<{
        data: Activity;
    }>;
    searchPointsOfInterest(params: {
        latitude: number;
        longitude: number;
        radius?: number;
        categories?: string[];
    }): Promise<{
        data: any[];
        meta: any;
    }>;
    getPointsOfInterestBySquare(params: {
        north: number;
        west: number;
        south: number;
        east: number;
        categories?: string[];
    }): Promise<{
        data: any[];
        meta: any;
    }>;
    getPointOfInterestDetails(poiId: string): Promise<{
        data: any;
    }>;
    transformActivities(activities: Activity[]): any[];
    transformPointsOfInterest(pois: any[]): any[];
    getActivityCategories(): string[];
    filterActivities(activities: any[], filters: {
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
        categories?: string[];
        hasImages?: boolean;
    }): any[];
    getCostStats(): {
        requestCount: number;
        cacheHits: number;
        cacheHitRate: string;
        sessionCacheSize: number;
    };
}
export declare const activityService: ActivityService;
//# sourceMappingURL=activity.service.d.ts.map