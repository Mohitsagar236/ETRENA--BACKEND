import request from 'supertest';
import express, { Application } from 'express';
import routes from '../../routes';

// Mock services
jest.mock('../../services/aggregation.service');
jest.mock('../../services/cache.service');
jest.mock('../../services/websocket.service');
jest.mock('../../services/dexscreener.client');
jest.mock('../../services/jupiter.client');
jest.mock('../../services/geckoterminal.client');

import aggregationService from '../../services/aggregation.service';
import { TokenData } from '../../types';

describe('API Integration Tests', () => {
  let app: Application;

  const mockTokenData: TokenData[] = [
    {
      token_address: 'test_addr_1',
      token_name: 'Test Token 1',
      token_ticker: 'TST1',
      price_sol: 0.001,
      market_cap_sol: 1000,
      volume_sol: 500,
      liquidity_sol: 200,
      transaction_count: 100,
      price_1hr_change: 5.5,
      price_24hr_change: 10.2,
      protocol: 'Raydium',
      sources: ['DexScreener'],
      last_updated: Date.now(),
    },
    {
      token_address: 'test_addr_2',
      token_name: 'Test Token 2',
      token_ticker: 'TST2',
      price_sol: 0.002,
      market_cap_sol: 2000,
      volume_sol: 1000,
      liquidity_sol: 400,
      transaction_count: 200,
      price_1hr_change: -2.3,
      price_24hr_change: 15.7,
      protocol: 'Orca',
      sources: ['GeckoTerminal'],
      last_updated: Date.now(),
    },
  ];

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', routes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (aggregationService.aggregateTokenData as jest.Mock).mockResolvedValue(mockTokenData);
  });

  describe('GET /api/tokens', () => {
    it('should return list of tokens', async () => {
      (aggregationService.filterAndSort as jest.Mock).mockResolvedValue(mockTokenData);
      (aggregationService.paginateTokens as jest.Mock).mockResolvedValue({
        tokens: mockTokenData,
        nextCursor: undefined,
        total: 2,
        timestamp: Date.now(),
      });

      const response = await request(app)
        .get('/api/tokens')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should handle filtering parameters', async () => {
      (aggregationService.filterAndSort as jest.Mock).mockResolvedValue([mockTokenData[0]]);
      (aggregationService.paginateTokens as jest.Mock).mockResolvedValue({
        tokens: [mockTokenData[0]],
        nextCursor: undefined,
        total: 1,
        timestamp: Date.now(),
      });

      const response = await request(app)
        .get('/api/tokens?minVolume=800&sortBy=volume&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(aggregationService.filterAndSort).toHaveBeenCalled();
    });

    it('should handle pagination parameters', async () => {
      (aggregationService.filterAndSort as jest.Mock).mockResolvedValue(mockTokenData);
      (aggregationService.paginateTokens as jest.Mock).mockResolvedValue({
        tokens: [mockTokenData[0]],
        nextCursor: '1',
        total: 2,
        timestamp: Date.now(),
      });

      const response = await request(app)
        .get('/api/tokens?limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toHaveLength(1);
      expect(response.body.data.nextCursor).toBe('1');
    });

    it('should handle errors gracefully', async () => {
      (aggregationService.aggregateTokenData as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .get('/api/tokens')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/tokens/:address', () => {
    it('should return specific token by address', async () => {
      const response = await request(app)
        .get('/api/tokens/test_addr_1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token_ticker).toBe('TST1');
    });

    it('should return 404 for non-existent token', async () => {
      const response = await request(app)
        .get('/api/tokens/non_existent_address')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token not found');
    });
  });

  describe('POST /api/cache/refresh', () => {
    it('should refresh cache successfully', async () => {
      (aggregationService.invalidateCache as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/cache/refresh')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(aggregationService.invalidateCache).toHaveBeenCalled();
    });

    it('should handle refresh errors', async () => {
      (aggregationService.invalidateCache as jest.Mock).mockRejectedValue(
        new Error('Cache error')
      );

      const response = await request(app)
        .post('/api/cache/refresh')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.rateLimiters).toBeDefined();
    });
  });

  describe('GET /api/metrics', () => {
    it('should return aggregated metrics', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalTokens).toBe(2);
      expect(response.body.data.averageVolume).toBeDefined();
      expect(response.body.data.topGainers).toBeDefined();
    });
  });
});
