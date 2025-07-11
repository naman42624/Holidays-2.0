"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class CacheService {
    constructor() {
        this.memoryCache = new node_cache_1.default({
            stdTTL: parseInt(process.env.CACHE_TTL || '3600'),
            checkperiod: 120,
            useClones: false,
            maxKeys: 10000,
        });
        this.isEnabled = process.env.ENABLE_CACHE !== 'false';
        if (this.isEnabled) {
            console.log('✅ Cache service enabled');
        }
        else {
            console.log('⚠️ Cache service disabled');
        }
    }
    generateKey(prefix, params) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
            result[key] = params[key];
            return result;
        }, {});
        return `${prefix}:${JSON.stringify(sortedParams)}`;
    }
    async get(key) {
        if (!this.isEnabled)
            return null;
        try {
            const result = this.memoryCache.get(key);
            if (result) {
                console.log(`🚀 Cache hit: ${key.substring(0, 50)}...`);
                return result;
            }
            return null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, data, ttl) {
        if (!this.isEnabled)
            return;
        try {
            this.memoryCache.set(key, data, ttl || 3600);
            console.log(`💾 Cache set: ${key.substring(0, 50)}...`);
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    async getCachedLocation(keyword, searchParams) {
        if (!this.isEnabled)
            return null;
        try {
            const cacheKey = this.generateKey('location', { keyword, ...searchParams });
            const memoryResult = this.memoryCache.get(cacheKey);
            if (memoryResult) {
                console.log(`🚀 Memory cache hit for location: ${keyword}`);
                return memoryResult;
            }
            return null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async setCachedLocation(keyword, searchParams, data, meta) {
        if (!this.isEnabled)
            return;
        try {
            const cacheKey = this.generateKey('location', { keyword, ...searchParams });
            this.memoryCache.set(cacheKey, data, 3600);
            console.log(`💿 Cached location data for: ${keyword}`);
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    async getCachedActivity(locationKey, searchParams) {
        if (!this.isEnabled)
            return null;
        try {
            const cacheKey = this.generateKey('activity', { locationKey, ...searchParams });
            const memoryResult = this.memoryCache.get(cacheKey);
            if (memoryResult) {
                console.log(`🚀 Memory cache hit for activity: ${locationKey}`);
                return memoryResult;
            }
            return null;
        }
        catch (error) {
            console.error('Activity cache get error:', error);
            return null;
        }
    }
    async setCachedActivity(locationKey, searchParams, data, meta) {
        if (!this.isEnabled)
            return;
        try {
            const cacheKey = this.generateKey('activity', { locationKey, ...searchParams });
            this.memoryCache.set(cacheKey, data, 1800);
            console.log(`💿 Cached activity data for: ${locationKey}`);
        }
        catch (error) {
            console.error('Activity cache set error:', error);
        }
    }
    async clearCache(type) {
        try {
            this.memoryCache.flushAll();
            console.log('🗑️ Cleared memory cache');
        }
        catch (error) {
            console.error('Cache clear error:', error);
        }
    }
    getCacheStats() {
        const memoryStats = this.memoryCache.getStats();
        return {
            enabled: this.isEnabled,
            memory: {
                keys: memoryStats.keys,
                hits: memoryStats.hits,
                misses: memoryStats.misses,
                hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses) || 0,
            },
        };
    }
}
exports.cacheService = new CacheService();
//# sourceMappingURL=cache.service.optimized.js.map