import Redis from 'ioredis';
import { config } from '../config';
import logger from '../utils/logger';

export class CacheService {
  private redis: Redis;
  private isConnected: boolean = false;
  private fallbackCache: Map<string, { value: any; expiresAt: number | null }> = new Map();

  constructor() {
    this.redis = new Redis(config.redis.url, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis connection error:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        return this.getFromFallback<T>(key);
      }

      const data = await this.redis.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.setFallback(key, value, ttl);
        return true;
      }

      const serialized = JSON.stringify(value);
      const cacheTTL = ttl || config.redis.cacheTTL;

      if (cacheTTL > 0) {
        await this.redis.setex(key, cacheTTL, serialized);
      } else {
        await this.redis.set(key, serialized);
      }

      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return this.fallbackCache.delete(key);
      }

      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
  const regex = this.patternToRegex(pattern);
        let removed = 0;
        for (const key of Array.from(this.fallbackCache.keys())) {
          if (regex.test(key)) {
            this.fallbackCache.delete(key);
            removed++;
          }
        }
        return removed;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        const entry = this.fallbackCache.get(key);
        if (!entry) {
          return false;
        }

        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          this.fallbackCache.delete(key);
          return false;
        }

        return true;
      }

      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }

  private getFromFallback<T>(key: string): T | null {
    const entry = this.fallbackCache.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.fallbackCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  private setFallback(key: string, value: any, ttl?: number): void {
    const cacheTTL = ttl || config.redis.cacheTTL;
    const expiresAt = cacheTTL > 0 ? Date.now() + cacheTTL * 1000 : null;

    this.fallbackCache.set(key, { value, expiresAt });
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .split('*')
      .map(part => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');

    return new RegExp(`^${escaped}$`);
  }
}

export default new CacheService();
