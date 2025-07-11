declare class CacheService {
    private memoryCache;
    private isEnabled;
    constructor();
    private generateKey;
    getCachedLocation(keyword: string, searchParams: object): Promise<any[] | null>;
    setCachedLocation(keyword: string, searchParams: object, data: any[], meta?: object): Promise<void>;
    getCachedActivity(locationKey: string, searchParams: object): Promise<any[] | null>;
    setCachedActivity(locationKey: string, searchParams: object, data: any[], meta?: object): Promise<void>;
    clearCache(type: 'location' | 'activity' | 'all'): Promise<void>;
    getCacheStats(): object;
    refreshPopularDestinations(): Promise<void>;
    del(key: string): void;
    has(key: string): boolean;
}
export declare const cacheService: CacheService;
export {};
//# sourceMappingURL=cache.service.old.d.ts.map