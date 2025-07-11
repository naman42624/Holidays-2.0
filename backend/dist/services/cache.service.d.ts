declare class CacheService {
    private memoryCache;
    private isEnabled;
    constructor();
    private generateKey;
    get(key: string): Promise<any | null>;
    set(key: string, data: any, ttl?: number): Promise<void>;
    getCachedLocation(keyword: string, searchParams: object): Promise<any[] | null>;
    setCachedLocation(keyword: string, searchParams: object, data: any[], meta?: object): Promise<void>;
    getCachedActivity(locationKey: string, searchParams: object): Promise<any[] | null>;
    setCachedActivity(locationKey: string, searchParams: object, data: any[], meta?: object): Promise<void>;
    clearCache(type: 'location' | 'activity' | 'all'): Promise<void>;
    getCacheStats(): object;
}
export declare const cacheService: CacheService;
export {};
//# sourceMappingURL=cache.service.d.ts.map