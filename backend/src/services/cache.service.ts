import NodeCache from 'node-cache';
import CachedLocation, { ICachedLocation } from '@/models/Cache';
import { CachedActivity, ICachedActivity } from '@/models/Cache';
import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

class CacheService {
  private memoryCache: NodeCache;
  private isEnabled: boolean;

  constructor() {
    console.log('🔥 NEW CACHE SERVICE LOADING - TIMESTAMP:', Date.now());
    
    // In-memory cache for frequently accessed data
    this.memoryCache = new NodeCache({
      stdTTL: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour default
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false,
      maxKeys: 10000, // Limit cache size
    });

    // Force cache enabled for now - there's a timing issue with env loading
    this.isEnabled = true;
    
    if (this.isEnabled) {
      console.log('✅ Cache service enabled (forced)');
    } else {
      console.log('⚠️ Cache service disabled');
    }
  }

  /**
   * Simple cache key generation
   */
  private generateKey(prefix: string, params: object): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: any, key) => {
        result[key] = (params as any)[key];
        return result;
      }, {});
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get from cache (memory only for speed)
   */
  async get(key: string): Promise<any | null> {
    if (!this.isEnabled) return null;
    
    try {
      const result = this.memoryCache.get(key);
      if (result) {
        console.log(`🚀 Cache hit: ${key.substring(0, 50)}...`);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set in cache (memory only for speed)
   */
  async set(key: string, data: any, ttl?: number): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      this.memoryCache.set(key, data, ttl || 3600); // 1 hour default
      console.log(`💾 Cache set: ${key.substring(0, 50)}...`);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Get cached location data
   */
  async getCachedLocation(keyword: string, searchParams: object): Promise<any[] | null> {
    if (!this.isEnabled) return null;

    try {
      const cacheKey = this.generateKey('location', { keyword, ...searchParams });
      
      // Check memory cache first
      const memoryResult = this.memoryCache.get(cacheKey);
      if (memoryResult) {
        console.log(`🚀 Memory cache hit for location: ${keyword}`);
        return memoryResult as any[];
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached location data
   */
  async setCachedLocation(
    keyword: string, 
    searchParams: object, 
    data: any[], 
    meta?: object
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const cacheKey = this.generateKey('location', { keyword, ...searchParams });
      
      // Store in memory cache
      this.memoryCache.set(cacheKey, data, 3600); // 1 hour

      console.log(`💿 Cached location data for: ${keyword}`);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Get cached activity data
   */
  async getCachedActivity(locationKey: string, searchParams: object): Promise<any[] | null> {
    if (!this.isEnabled) return null;

    try {
      const cacheKey = this.generateKey('activity', { locationKey, ...searchParams });
      
      // Check memory cache first
      const memoryResult = this.memoryCache.get(cacheKey);
      if (memoryResult) {
        console.log(`🚀 Memory cache hit for activity: ${locationKey}`);
        return memoryResult as any[];
      }

      return null;
    } catch (error) {
      console.error('Activity cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached activity data
   */
  async setCachedActivity(
    locationKey: string, 
    searchParams: object, 
    data: any[], 
    meta?: object
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const cacheKey = this.generateKey('activity', { locationKey, ...searchParams });
      
      // Store in memory cache
      this.memoryCache.set(cacheKey, data, 1800); // 30 minutes

      console.log(`💿 Cached activity data for: ${locationKey}`);
    } catch (error) {
      console.error('Activity cache set error:', error);
    }
  }

  /**
   * Clear specific cache
   */
  async clearCache(type: 'location' | 'activity' | 'all'): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.flushAll();
      console.log('🗑️ Cleared memory cache');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): object {
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

export const cacheService = new CacheService();
