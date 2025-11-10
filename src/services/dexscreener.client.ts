import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from '../config';
import logger from '../utils/logger';
import { RateLimiter, exponentialBackoff } from '../utils/rateLimiter';
import { DexScreenerPair } from '../types';

export class DexScreenerClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = axios.create({
      baseURL: config.apis.dexScreener,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               error.response?.status === 429;
      },
    });

    this.rateLimiter = new RateLimiter({
      requestsPerMinute: config.rateLimits.dexScreener,
      name: 'DexScreener',
    });
  }

  async getTokensByAddress(addresses: string[]): Promise<DexScreenerPair[]> {
    await this.rateLimiter.acquire();

    return exponentialBackoff(async () => {
      try {
        logger.debug(`Fetching tokens from DexScreener: ${addresses.join(',')}`);
        const response = await this.client.get(`/tokens/${addresses.join(',')}`);
        
        if (response.data && response.data.pairs) {
          logger.info(`DexScreener: Found ${response.data.pairs.length} pairs`);
          return response.data.pairs;
        }
        
        return [];
      } catch (error: any) {
        logger.error('DexScreener API error:', error.message);
        throw error;
      }
    });
  }

  async searchTokens(query: string): Promise<DexScreenerPair[]> {
    await this.rateLimiter.acquire();

    return exponentialBackoff(async () => {
      try {
        logger.debug(`Searching tokens on DexScreener: ${query}`);
        const response = await this.client.get(`/search?q=${encodeURIComponent(query)}`);
        
        if (response.data && response.data.pairs) {
          logger.info(`DexScreener search: Found ${response.data.pairs.length} pairs`);
          return response.data.pairs;
        }
        
        return [];
      } catch (error: any) {
        logger.error('DexScreener search error:', error.message);
        throw error;
      }
    });
  }

  getRateLimiterStatus() {
    return this.rateLimiter.getStatus();
  }
}

export default new DexScreenerClient();
