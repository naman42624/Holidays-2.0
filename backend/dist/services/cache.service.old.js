"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const Cache_1 = __importDefault(require("@/models/Cache"));
const Cache_2 = require("@/models/Cache");
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
            const dbResult = await Cache_1.default.findOne({
                keyword: keyword.toLowerCase(),
                expiresAt: { $gt: new Date() },
            }).lean();
            if (dbResult) {
                console.log(`💾 Database cache hit for location: ${keyword}`);
                this.memoryCache.set(cacheKey, dbResult.data);
                return dbResult.data;
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
            this.memoryCache.set(cacheKey, data);
            await Cache_1.default.findOneAndUpdate({ keyword: keyword.toLowerCase() }, {
                keyword: keyword.toLowerCase(),
                searchParams,
                data,
                meta: meta || {},
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }, { upsert: true, new: true });
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
            const dbResult = await Cache_2.CachedActivity.findOne({
                locationKey,
                expiresAt: { $gt: new Date() },
            }).lean();
            if (dbResult) {
                console.log(`💾 Database cache hit for activity: ${locationKey}`);
                this.memoryCache.set(cacheKey, dbResult.data);
                return dbResult.data;
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
            this.memoryCache.set(cacheKey, data);
            await Cache_2.CachedActivity.findOneAndUpdate({ locationKey }, {
                locationKey,
                searchParams,
                data,
                meta: meta || {},
                expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
            }, { upsert: true, new: true });
            console.log(`💿 Cached activity data for: ${locationKey}`);
        }
        catch (error) {
            console.error('Activity cache set error:', error);
        }
    }
    async clearCache(type) {
        try {
            if (type === 'location' || type === 'all') {
                await Cache_1.default.deleteMany({});
                console.log('🗑️ Cleared location cache');
            }
            if (type === 'activity' || type === 'all') {
                await Cache_2.CachedActivity.deleteMany({});
                console.log('🗑️ Cleared activity cache');
            }
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
    async refreshPopularDestinations() {
        const popularKeywords = [
            'new york', 'london', 'paris', 'tokyo', 'singapore', 'dubai',
            'los angeles', 'bangkok', 'istanbul', 'amsterdam', 'barcelona',
            'rome', 'madrid', 'mumbai', 'delhi', 'sydney', 'melbourne',
            'toronto', 'vancouver', 'san francisco', 'miami', 'las vegas'
        ];
        console.log('🔄 Starting cache refresh for popular destinations...');
        for (const keyword of popularKeywords) {
            try {
                console.log(`Refreshing cache for: ${keyword}`);
            }
            catch (error) {
                console.error(`Failed to refresh cache for ${keyword}:`, error);
            }
        }
        console.log('✅ Popular destinations cache refresh completed');
    }
    get(key) {
        if (!this.isEnabled)
            return null;
        try {
            const result = this.memoryCache.get(key);
            if (result) {
                console.log(`🚀 Generic cache hit: ${key.substring(0, 50)}...`);
            }
            return result || null;
        }
        catch (error) {
            console.error('Generic cache get error:', error);
            return null;
        }
    }
    set(key, value, ttl) {
        if (!this.isEnabled)
            return;
        try {
            if (ttl) {
                this.memoryCache.set(key, value, ttl);
            }
            else {
                this.memoryCache.set(key, value);
            }
            console.log(`💿 Generic cache set: ${key.substring(0, 50)}...`);
        }
        catch (error) {
            console.error('Generic cache set error:', error);
        }
    }
    del(key) {
        if (!this.isEnabled)
            return;
        try {
            this.memoryCache.del(key);
        }
        catch (error) {
            console.error('Generic cache delete error:', error);
        }
    }
    has(key) {
        if (!this.isEnabled)
            return false;
        try {
            return this.memoryCache.has(key);
        }
        catch (error) {
            console.error('Generic cache has error:', error);
            return false;
        }
    }
}
exports.cacheService = new CacheService();
//# sourceMappingURL=cache.service.old.js.map