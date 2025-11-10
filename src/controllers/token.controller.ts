import { Request, Response } from 'express';
import aggregationService from '../services/aggregation.service';
import dexScreenerClient from '../services/dexscreener.client';
import jupiterClient from '../services/jupiter.client';
import geckoTerminalClient from '../services/geckoterminal.client';
import websocketService from '../services/websocket.service';
import cacheService from '../services/cache.service';
import logger from '../utils/logger';
import { FilterParams, PaginationParams, ApiResponse, TokenListResponse } from '../types';

export class TokenController {
  async getTokens(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();

      // Parse query parameters
      const filters: FilterParams = {
        timePeriod: (req.query.timePeriod as '1h' | '24h' | '7d') || '24h',
        sortBy: (req.query.sortBy as any) || 'volume',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        minVolume: req.query.minVolume ? parseFloat(req.query.minVolume as string) : undefined,
        minMarketCap: req.query.minMarketCap ? parseFloat(req.query.minMarketCap as string) : undefined,
      };

      const pagination: PaginationParams = {
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        cursor: req.query.cursor as string,
      };

      // Aggregate data
      const tokens = await aggregationService.aggregateTokenData();

      // Apply filters and sorting
      const filteredTokens = await aggregationService.filterAndSort(tokens, filters);

      // Paginate
      const result = await aggregationService.paginateTokens(filteredTokens, pagination);

      const responseTime = Date.now() - startTime;

      const response: ApiResponse<TokenListResponse> = {
        success: true,
        data: result,
        timestamp: Date.now(),
      };

      res.header('X-Response-Time', `${responseTime}ms`);
      res.json(response);

      logger.info(`GET /api/tokens - ${result.tokens.length} tokens returned in ${responseTime}ms`);
    } catch (error: any) {
      logger.error('Error fetching tokens:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: Date.now(),
      });
    }
  }

  async getTokenByAddress(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;

      if (!address) {
        res.status(400).json({
          success: false,
          error: 'Token address is required',
          timestamp: Date.now(),
        });
        return;
      }

      const tokens = await aggregationService.aggregateTokenData();
      const token = tokens.find(t => t.token_address.toLowerCase() === address.toLowerCase());

      if (!token) {
        res.status(404).json({
          success: false,
          error: 'Token not found',
          timestamp: Date.now(),
        });
        return;
      }

      res.json({
        success: true,
        data: token,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error fetching token by address:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: Date.now(),
      });
    }
  }

  async refreshCache(req: Request, res: Response): Promise<void> {
    try {
      await aggregationService.invalidateCache();
      
      res.json({
        success: true,
        data: { message: 'Cache refreshed successfully' },
        timestamp: Date.now(),
      });
      
      logger.info('Cache manually refreshed');
    } catch (error: any) {
      logger.error('Error refreshing cache:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: Date.now(),
      });
    }
  }

  async getHealth(req: Request, res: Response): Promise<void> {
    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      redis: cacheService.isReady(),
      websocket: {
        connected: websocketService.getConnectedClients(),
      },
      rateLimiters: {
        dexScreener: dexScreenerClient.getRateLimiterStatus(),
        jupiter: jupiterClient.getRateLimiterStatus(),
        geckoTerminal: geckoTerminalClient.getRateLimiterStatus(),
      },
    };

    res.json(health);
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const tokens = await aggregationService.aggregateTokenData();
      
      const metrics = {
        totalTokens: tokens.length,
        averageVolume: tokens.reduce((acc, t) => acc + t.volume_sol, 0) / tokens.length,
        averageMarketCap: tokens.reduce((acc, t) => acc + t.market_cap_sol, 0) / tokens.length,
        topGainers: tokens
          .sort((a, b) => b.price_1hr_change - a.price_1hr_change)
          .slice(0, 5)
          .map(t => ({
            ticker: t.token_ticker,
            change: t.price_1hr_change,
          })),
        topVolume: tokens
          .sort((a, b) => b.volume_sol - a.volume_sol)
          .slice(0, 5)
          .map(t => ({
            ticker: t.token_ticker,
            volume: t.volume_sol,
          })),
        timestamp: Date.now(),
      };

      res.json({
        success: true,
        data: metrics,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error fetching metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: Date.now(),
      });
    }
  }
}

export default new TokenController();
