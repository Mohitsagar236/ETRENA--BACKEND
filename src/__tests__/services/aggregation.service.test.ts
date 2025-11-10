import aggregationService from '../../services/aggregation.service';
import { TokenData, FilterParams, PaginationParams } from '../../types';

// Mock dependencies
jest.mock('../../services/dexscreener.client');
jest.mock('../../services/jupiter.client');
jest.mock('../../services/geckoterminal.client');
jest.mock('../../services/cache.service');

describe('AggregationService', () => {
  const mockTokens: TokenData[] = [
    {
      token_address: 'addr1',
      token_name: 'Token 1',
      token_ticker: 'TK1',
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
      token_address: 'addr2',
      token_name: 'Token 2',
      token_ticker: 'TK2',
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
    {
      token_address: 'addr3',
      token_name: 'Token 3',
      token_ticker: 'TK3',
      price_sol: 0.0015,
      market_cap_sol: 1500,
      volume_sol: 750,
      liquidity_sol: 300,
      transaction_count: 150,
      price_1hr_change: 8.9,
      price_24hr_change: 5.4,
      protocol: 'Raydium',
      sources: ['DexScreener', 'Jupiter'],
      last_updated: Date.now(),
    },
  ];

  describe('filterAndSort', () => {
    it('should filter by minimum volume', async () => {
      const filters: FilterParams = {
        minVolume: 800,
      };

      const result = await aggregationService.filterAndSort(mockTokens, filters);
      
      expect(result.length).toBe(1);
      expect(result[0].token_ticker).toBe('TK2');
    });

    it('should filter by minimum market cap', async () => {
      const filters: FilterParams = {
        minMarketCap: 1800,
      };

      const result = await aggregationService.filterAndSort(mockTokens, filters);
      
      expect(result.length).toBe(1);
      expect(result[0].token_ticker).toBe('TK2');
    });

    it('should sort by volume descending', async () => {
      const filters: FilterParams = {
        sortBy: 'volume',
        sortOrder: 'desc',
      };

      const result = await aggregationService.filterAndSort(mockTokens, filters);
      
      expect(result[0].token_ticker).toBe('TK2');
      expect(result[1].token_ticker).toBe('TK3');
      expect(result[2].token_ticker).toBe('TK1');
    });

    it('should sort by market cap ascending', async () => {
      const filters: FilterParams = {
        sortBy: 'market_cap',
        sortOrder: 'asc',
      };

      const result = await aggregationService.filterAndSort(mockTokens, filters);
      
      expect(result[0].token_ticker).toBe('TK1');
      expect(result[1].token_ticker).toBe('TK3');
      expect(result[2].token_ticker).toBe('TK2');
    });

    it('should sort by price change', async () => {
      const filters: FilterParams = {
        sortBy: 'price_change',
        timePeriod: '1h',
        sortOrder: 'desc',
      };

      const result = await aggregationService.filterAndSort(mockTokens, filters);
      
      expect(result[0].token_ticker).toBe('TK3');
      expect(result[1].token_ticker).toBe('TK1');
      expect(result[2].token_ticker).toBe('TK2');
    });
  });

  describe('paginateTokens', () => {
    it('should paginate with default limit', async () => {
      const pagination: PaginationParams = {
        limit: 2,
      };

      const result = await aggregationService.paginateTokens(mockTokens, pagination);
      
      expect(result.tokens.length).toBe(2);
      expect(result.total).toBe(3);
      const encodeCursor = (aggregationService as any).encodeCursor.bind(aggregationService);
      expect(result.nextCursor).toBe(encodeCursor({ index: 2, limit: 2 }));
    });

    it('should paginate with cursor', async () => {
      const firstPage = await aggregationService.paginateTokens(mockTokens, { limit: 2 });
      expect(firstPage.nextCursor).toBeDefined();

      const pagination: PaginationParams = {
        limit: 2,
        cursor: firstPage.nextCursor,
      };

      const result = await aggregationService.paginateTokens(mockTokens, pagination);
      
      expect(result.tokens.length).toBe(1);
      expect(result.nextCursor).toBeUndefined();
    });

    it('should return empty nextCursor on last page', async () => {
      const pagination: PaginationParams = {
        limit: 10,
      };

      const result = await aggregationService.paginateTokens(mockTokens, pagination);
      
      expect(result.tokens.length).toBe(3);
      expect(result.nextCursor).toBeUndefined();
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache successfully', async () => {
      await expect(aggregationService.invalidateCache()).resolves.not.toThrow();
    });
  });
});
