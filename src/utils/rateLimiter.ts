import logger from './logger';

interface RateLimiterConfig {
  requestsPerMinute: number;
  name: string;
}

export class RateLimiter {
  private requestsPerMinute: number;
  private name: string;
  private queue: Array<() => void> = [];
  private currentRequests = 0;
  private resetTime: number;

  constructor(config: RateLimiterConfig) {
    this.requestsPerMinute = config.requestsPerMinute;
    this.name = config.name;
    this.resetTime = Date.now() + 60000;

    // Reset counter every minute
    setInterval(() => {
      this.currentRequests = 0;
      this.resetTime = Date.now() + 60000;
      this.processQueue();
    }, 60000);
  }

  async acquire(): Promise<void> {
    if (this.currentRequests < this.requestsPerMinute) {
      this.currentRequests++;
      return Promise.resolve();
    }

    // Wait in queue
    return new Promise((resolve) => {
      this.queue.push(resolve);
      logger.debug(`${this.name}: Request queued. Queue size: ${this.queue.length}`);
    });
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.currentRequests < this.requestsPerMinute) {
      const resolve = this.queue.shift();
      if (resolve) {
        this.currentRequests++;
        resolve();
      }
    }
  }

  getStatus() {
    return {
      name: this.name,
      currentRequests: this.currentRequests,
      limit: this.requestsPerMinute,
      queueSize: this.queue.length,
      resetTime: this.resetTime,
    };
  }
}

export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error as Error;
      
      // Don't retry on authentication errors (401) or client errors (4xx)
      if (error.response?.status === 401 || (error.response?.status >= 400 && error.response?.status < 500)) {
        logger.debug(`Non-retryable error (${error.response?.status}), stopping retries`);
        throw lastError;
      }
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * delay * 0.1;
        const totalDelay = delay + jitter;
        
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${totalDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
  }

  throw lastError!;
}
