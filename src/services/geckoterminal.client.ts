import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from '../config';
import logger from '../utils/logger';
import { RateLimiter, exponentialBackoff } from '../utils/rateLimiter';
import { GeckoTerminalToken } from '../types';

export class GeckoTerminalClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = axios.create({
      baseURL: config.apis.geckoTerminal,
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
      requestsPerMinute: config.rateLimits.geckoTerminal,
      name: 'GeckoTerminal',
    });
  }

  async getSolanaTokens(addresses?: string[]): Promise<GeckoTerminalToken[]> {
    await this.rateLimiter.acquire();

    return exponentialBackoff(async () => {
      try {
        let url = '/networks/solana/tokens';
        
        if (addresses && addresses.length > 0) {
          url = `/networks/solana/tokens/multi/${addresses.join(',')}`;
        }
        
        logger.debug(`Fetching tokens from GeckoTerminal: ${url}`);
        const response = await this.client.get(url);
        
        if (response.data && response.data.data) {
          const tokens = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
          logger.info(`GeckoTerminal: Found ${tokens.length} tokens`);
          return tokens;
        }
        
        return [];
      } catch (error: any) {
        logger.error('GeckoTerminal API error:', error.message);
        throw error;
      }
    });
  }

  async getTrendingTokens(): Promise<GeckoTerminalToken[]> {
    await this.rateLimiter.acquire();

    return exponentialBackoff(async () => {
      try {
        logger.debug('Fetching trending tokens from GeckoTerminal');
        const response = await this.client.get('/networks/solana/trending_pools');
        
        if (response.data && response.data.data) {
          logger.info(`GeckoTerminal: Found ${response.data.data.length} trending tokens`);
          return response.data.data;
        }
        
        return [];
      } catch (error: any) {
        logger.error('GeckoTerminal trending tokens error:', error.message);
        throw error;
      }
    });
  }

  getRateLimiterStatus() {
    return this.rateLimiter.getStatus();
  }
}

export default new GeckoTerminalClient();
