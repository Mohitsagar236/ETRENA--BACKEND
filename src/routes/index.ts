import { Router } from 'express';
import tokenController from '../controllers/token.controller';

const router = Router();

/**
 * @route GET /api/tokens
 * @desc Get list of tokens with filtering, sorting, and pagination
 * @query {string} [timePeriod] - Time period: 1h, 24h, 7d
 * @query {string} [sortBy] - Sort by: volume, price_change, market_cap, liquidity
 * @query {string} [sortOrder] - Order: asc, desc
 * @query {number} [minVolume] - Minimum volume filter
 * @query {number} [minMarketCap] - Minimum market cap filter
 * @query {number} [limit] - Page size (default: 20, max: 100)
 * @query {string} [cursor] - Pagination cursor
 */
router.get('/tokens', tokenController.getTokens.bind(tokenController));

/**
 * @route GET /api/tokens/:address
 * @desc Get specific token by address
 * @param {string} address - Token address
 */
router.get('/tokens/:address', tokenController.getTokenByAddress.bind(tokenController));

/**
 * @route POST /api/cache/refresh
 * @desc Manually refresh cache
 */
router.post('/cache/refresh', tokenController.refreshCache.bind(tokenController));

/**
 * @route GET /api/health
 * @desc Health check endpoint
 */
router.get('/health', tokenController.getHealth.bind(tokenController));

/**
 * @route GET /api/metrics
 * @desc Get aggregated metrics
 */
router.get('/metrics', tokenController.getMetrics.bind(tokenController));

export default router;
