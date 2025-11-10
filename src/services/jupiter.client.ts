import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from '../config';
import logger from '../utils/logger';
import { RateLimiter, exponentialBackoff } from '../utils/rateLimiter';
import { JupiterPriceData } from '../types';

export class JupiterClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = axios.create({
      baseURL: config.apis.jupiter,
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
      requestsPerMinute: config.rateLimits.jupiter,
      name: 'Jupiter',
    });
  }

  async getPrices(tokenIds: string[]): Promise<JupiterPriceData | null> {
    await this.rateLimiter.acquire();

    return exponentialBackoff(async () => {
      try {
        // Jupiter API v2 expects comma-separated IDs as query parameter
        const ids = tokenIds.slice(0, 100).join(','); // Limit to 100 tokens per request
        logger.debug(`Fetching prices from Jupiter for ${tokenIds.length} tokens`);
        
        const response = await this.client.get('', {
          params: { ids }
        });
        
        if (response.data && response.data.data) {
          logger.info(`Jupiter: Fetched prices for ${Object.keys(response.data.data).length} tokens`);
          return response.data;
        }
        
        logger.debug('Jupiter: No price data returned');
        return null;
      } catch (error: any) {
        if (error.response?.status === 401) {
          logger.debug('Jupiter API requires authentication - feature disabled');
          return null; // Don't retry on auth errors
        } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
          logger.debug('Jupiter API DNS error - service temporarily unavailable');
        } else {
          logger.debug('Jupiter API error:', error.message);
        }
        throw error;
      }
    });
  }

  getRateLimiterStatus() {
    return this.rateLimiter.getStatus();
  }
}

export default new JupiterClient();
