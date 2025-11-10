import { CacheService } from '../../services/cache.service';

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    let store: { [key: string]: string } = {};
    let connected = false;

    setTimeout(() => {
      connected = true;
      if (mockRedis.onCallback) mockRedis.onCallback('connect');
    }, 100);

    const mockRedis = {
      get: jest.fn((key: string) => Promise.resolve(store[key] || null)),
      set: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve('OK');
      }),
      setex: jest.fn((key: string, ttl: number, value: string) => {
        store[key] = value;
        return Promise.resolve('OK');
      }),
      del: jest.fn((...keys: string[]) => {
        keys.forEach(key => delete store[key]);
        return Promise.resolve(keys.length);
      }),
      keys: jest.fn((pattern: string) => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return Promise.resolve(Object.keys(store).filter(key => regex.test(key)));
      }),
      exists: jest.fn((key: string) => Promise.resolve(store[key] ? 1 : 0)),
      quit: jest.fn(() => {
        connected = false;
        return Promise.resolve('OK');
      }),
      on: jest.fn((event: string, callback: Function) => {
        mockRedis.onCallback = callback;
        if (event === 'connect' && connected) {
          callback();
        }
      }),
      onCallback: null as Function | null,
    };

    return mockRedis;
  });
});

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService = new CacheService();
  });

  afterEach(async () => {
    await cacheService.disconnect();
  });

  it('should set and get a value', async () => {
    await new Promise(resolve => setTimeout(resolve, 150)); // Wait for connection
    
    const testData = { id: 1, name: 'Test Token' };
    await cacheService.set('test:key', testData, 60);
    
    const result = await cacheService.get('test:key');
    expect(result).toEqual(testData);
  });

  it('should return null for non-existent key', async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const result = await cacheService.get('non:existent');
    expect(result).toBeNull();
  });

  it('should delete a key', async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    await cacheService.set('test:delete', { data: 'test' });
    await cacheService.delete('test:delete');
    
    const result = await cacheService.get('test:delete');
    expect(result).toBeNull();
  });

  it('should delete keys by pattern', async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    await cacheService.set('tokens:1', { id: 1 });
    await cacheService.set('tokens:2', { id: 2 });
    await cacheService.set('other:1', { id: 3 });
    
    const deletedCount = await cacheService.deletePattern('tokens:*');
    expect(deletedCount).toBeGreaterThanOrEqual(0);
  });

  it('should check if key exists', async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    await cacheService.set('test:exists', { data: 'test' });
    
    const exists = await cacheService.exists('test:exists');
    const notExists = await cacheService.exists('test:not:exists');
    
    expect(exists).toBe(true);
    expect(notExists).toBe(false);
  });
});
