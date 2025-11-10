import { RateLimiter, exponentialBackoff } from '../../utils/rateLimiter';

describe('RateLimiter', () => {
  jest.setTimeout(10000);

  it('should allow requests within the limit', async () => {
    const limiter = new RateLimiter({
      requestsPerMinute: 5,
      name: 'TestLimiter',
    });

    const promises = Array(5).fill(null).map(() => limiter.acquire());
    await expect(Promise.all(promises)).resolves.not.toThrow();
  });

  it('should queue requests exceeding the limit', async () => {
    const limiter = new RateLimiter({
      requestsPerMinute: 2,
      name: 'TestLimiter',
    });

    const start = Date.now();
    await limiter.acquire();
    await limiter.acquire();
    
    const status = limiter.getStatus();
    expect(status.currentRequests).toBe(2);
  });

  it('should return correct status', () => {
    const limiter = new RateLimiter({
      requestsPerMinute: 10,
      name: 'TestLimiter',
    });

    const status = limiter.getStatus();
    expect(status.name).toBe('TestLimiter');
    expect(status.limit).toBe(10);
    expect(status.currentRequests).toBe(0);
  });
});

describe('exponentialBackoff', () => {
  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await exponentialBackoff(fn, 3, 100);
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');
    
    const result = await exponentialBackoff(fn, 5, 10);
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fail'));
    
    await expect(exponentialBackoff(fn, 3, 10)).rejects.toThrow('always fail');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
