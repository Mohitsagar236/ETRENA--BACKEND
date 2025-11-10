import { Buffer } from 'node:buffer';
import { TokenData, DexScreenerPair, GeckoTerminalToken, FilterParams, PaginationParams, TokenListResponse } from '../types';
import dexScreenerClient from './dexscreener.client';
import jupiterClient from './jupiter.client';
import geckoTerminalClient from './geckoterminal.client';
import cacheService from './cache.service';
import logger from '../utils/logger';
import { config } from '../config';

export class AggregationService {
  private readonly CACHE_KEY_PREFIX = 'tokens:';
  private readonly CACHE_KEY_ALL = 'tokens:all';

  async aggregateTokenData(): Promise<TokenData[]> {
    try {
      // Check cache first
      const cached = await cacheService.get<TokenData[]>(this.CACHE_KEY_ALL);
      if (cached && cached.length > 0) {
        logger.debug(`Returning ${cached.length} tokens from cache`);
        return cached;
      }

      // Fetch from multiple sources in parallel
      const [dexScreenerData, geckoTerminalData] = await Promise.allSettled([
        this.fetchFromDexScreener(),
        this.fetchFromGeckoTerminal(),
      ]);

      let allTokens: TokenData[] = [];

      // Process DexScreener data
      if (dexScreenerData.status === 'fulfilled') {
        allTokens.push(...dexScreenerData.value);
      } else {
        logger.error('DexScreener fetch failed:', dexScreenerData.reason);
      }

      // Process GeckoTerminal data
      if (geckoTerminalData.status === 'fulfilled') {
        allTokens.push(...geckoTerminalData.value);
      } else {
        logger.error('GeckoTerminal fetch failed:', geckoTerminalData.reason);
      }

      // Merge duplicate tokens
      const mergedTokens = this.mergeTokens(allTokens);

      // Enrich with Jupiter prices
      const enrichedTokens = await this.enrichWithJupiterPrices(mergedTokens);

      // Cache the results
      await cacheService.set(this.CACHE_KEY_ALL, enrichedTokens);

      logger.info(`Aggregated ${enrichedTokens.length} unique tokens`);
      return enrichedTokens;
    } catch (error) {
      logger.error('Token aggregation error:', error);
      return [];
    }
  }

  private async fetchFromDexScreener(): Promise<TokenData[]> {
    try {
      // Search for popular Solana tokens
      const pairs = await dexScreenerClient.searchTokens('SOL');
      
      return pairs
        .filter(pair => pair.chainId === 'solana')
        .slice(0, 50) // Limit to 50 tokens
        .map(pair => this.transformDexScreenerPair(pair));
    } catch (error) {
      logger.error('DexScreener fetch error:', error);
      return [];
    }
  }

  private async fetchFromGeckoTerminal(): Promise<TokenData[]> {
    try {
      const tokens = await geckoTerminalClient.getTrendingTokens();
      
      return tokens
        .slice(0, 30)
        .map(token => this.transformGeckoTerminalToken(token));
    } catch (error) {
      logger.error('GeckoTerminal fetch error:', error);
      return [];
    }
  }

  private transformDexScreenerPair(pair: DexScreenerPair): TokenData {
    const priceNative = parseFloat(pair.priceNative) || 0;
    const volume = pair.volume?.h24 || 0;
    const priceChange1h = pair.priceChange?.h1 || 0;
    const priceChange24h = pair.priceChange?.h24 || 0;
    const priceChange7d =
      pair.priceChange?.d7 ?? pair.priceChange?.w1 ?? pair.priceChange?.h24 ?? 0;
    const txCount = (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0);
    const liquidity = pair.liquidity?.usd || 0;

    return {
      token_address: pair.baseToken.address,
      token_name: pair.baseToken.name,
      token_ticker: pair.baseToken.symbol,
      price_sol: priceNative,
      market_cap_sol: (pair.marketCap || 0) / (priceNative > 0 ? 1 / priceNative : 1),
      volume_sol: volume / 100, // Rough conversion
      liquidity_sol: liquidity / 100,
      transaction_count: txCount,
      price_1hr_change: priceChange1h,
  price_24hr_change: priceChange24h,
  price_7d_change: priceChange7d,
      protocol: pair.dexId,
      sources: ['DexScreener'],
      last_updated: Date.now(),
    };
  }

  private transformGeckoTerminalToken(token: GeckoTerminalToken): TokenData {
    const priceUsd = parseFloat(token.attributes.price_usd) || 0;
    const volumeUsd = parseFloat(token.attributes.volume_usd?.h24 || '0');
    const marketCapUsd = parseFloat(token.attributes.market_cap_usd || '0');
    const liquidityUsd = parseFloat(token.attributes.total_reserve_in_usd || '0');

    // Rough SOL conversion (assuming SOL ~ $100)
    const solPrice = 100;
    
    return {
      token_address: token.attributes.address,
      token_name: token.attributes.name,
      token_ticker: token.attributes.symbol,
      price_sol: priceUsd / solPrice,
      market_cap_sol: marketCapUsd / solPrice,
      volume_sol: volumeUsd / solPrice,
      liquidity_sol: liquidityUsd / solPrice,
      transaction_count: 0,
      price_1hr_change: 0,
  price_24hr_change: 0,
  price_7d_change: 0,
      protocol: 'GeckoTerminal',
      sources: ['GeckoTerminal'],
      last_updated: Date.now(),
    };
  }

  private mergeTokens(tokens: TokenData[]): TokenData[] {
    const tokenMap = new Map<string, TokenData>();

    for (const token of tokens) {
      const key = token.token_address.toLowerCase();
      
      if (tokenMap.has(key)) {
        const existing = tokenMap.get(key)!;
        
        // Merge data from multiple sources
        tokenMap.set(key, {
          ...existing,
          sources: [...new Set([...existing.sources, ...token.sources])],
          volume_sol: Math.max(existing.volume_sol, token.volume_sol),
          liquidity_sol: Math.max(existing.liquidity_sol, token.liquidity_sol),
          transaction_count: Math.max(existing.transaction_count, token.transaction_count),
          price_1hr_change: token.price_1hr_change ?? existing.price_1hr_change,
          price_24hr_change: token.price_24hr_change ?? existing.price_24hr_change,
          price_7d_change: token.price_7d_change ?? existing.price_7d_change,
          last_updated: Date.now(),
        });
      } else {
        tokenMap.set(key, token);
      }
    }

    return Array.from(tokenMap.values());
  }

  private async enrichWithJupiterPrices(tokens: TokenData[]): Promise<TokenData[]> {
    try {
      const addresses = tokens.slice(0, 100).map(t => t.token_address);
      
      if (addresses.length === 0) return tokens;

      const priceData = await jupiterClient.getPrices(addresses);
      
      if (!priceData || !priceData.data) {
        logger.debug('Jupiter enrichment: No data returned (using existing prices)');
        return tokens;
      }

      return tokens.map(token => {
        const jupiterPrice = priceData.data[token.token_address];
        if (jupiterPrice) {
          return {
            ...token,
            price_sol: jupiterPrice.price,
            sources: [...new Set([...token.sources, 'Jupiter'])],
          };
        }
        return token;
      });
    } catch (error: any) {
      // Jupiter enrichment is completely optional - we already have prices from DexScreener/GeckoTerminal
      if (error.response?.status === 401) {
        logger.debug('Jupiter API requires authentication - skipping enrichment (prices available from other sources)');
      } else {
        logger.debug('Jupiter enrichment unavailable - using DexScreener/GeckoTerminal prices');
      }
      return tokens;
    }
  }

  async filterAndSort(
    tokens: TokenData[],
    filters: FilterParams
  ): Promise<TokenData[]> {
    let filtered = [...tokens];

    // Apply filters
    if (filters.minVolume !== undefined) {
      filtered = filtered.filter(t => t.volume_sol >= filters.minVolume!);
    }

    if (filters.minMarketCap !== undefined) {
      filtered = filtered.filter(t => t.market_cap_sol >= filters.minMarketCap!);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'volume';
    const sortOrder = filters.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      switch (sortBy) {
        case 'volume':
          aVal = a.volume_sol;
          bVal = b.volume_sol;
          break;
        case 'market_cap':
          aVal = a.market_cap_sol;
          bVal = b.market_cap_sol;
          break;
        case 'liquidity':
          aVal = a.liquidity_sol;
          bVal = b.liquidity_sol;
          break;
        case 'price_change':
          const timePeriod = filters.timePeriod || '24h';
          if (timePeriod === '1h') {
            aVal = a.price_1hr_change;
            bVal = b.price_1hr_change;
          } else if (timePeriod === '7d') {
            aVal = a.price_7d_change ?? a.price_24hr_change ?? 0;
            bVal = b.price_7d_change ?? b.price_24hr_change ?? 0;
          } else {
            aVal = a.price_24hr_change || 0;
            bVal = b.price_24hr_change || 0;
          }
          break;
      }

      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }

  async paginateTokens(
    tokens: TokenData[],
    pagination: PaginationParams
  ): Promise<TokenListResponse> {
    const limit = Math.min(
      pagination.limit || config.pagination.defaultLimit,
      config.pagination.maxLimit
    );

    let startIndex = 0;
    if (pagination.cursor) {
      const decoded = this.decodeCursor(pagination.cursor);
      if (decoded && decoded.index >= 0) {
        startIndex = decoded.index;
      } else {
        logger.warn(`Invalid pagination cursor received: ${pagination.cursor}`);
      }
    }

    const endIndex = startIndex + limit;
    const paginatedTokens = tokens.slice(startIndex, endIndex);
    
    const nextCursor = endIndex < tokens.length
      ? this.encodeCursor({ index: endIndex, limit })
      : undefined;

    return {
      tokens: paginatedTokens,
      nextCursor,
      total: tokens.length,
      timestamp: Date.now(),
    };
  }

  async invalidateCache(): Promise<void> {
    await cacheService.deletePattern(`${this.CACHE_KEY_PREFIX}*`);
    logger.info('Token cache invalidated');
  }

  private encodeCursor(payload: { index: number; limit: number }): string {
    const json = JSON.stringify(payload);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private decodeCursor(cursor: string): { index: number; limit?: number } | null {
    try {
      const normalized = cursor.replace(/-/g, '+').replace(/_/g, '/');
      const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
      const buffer = Buffer.from(normalized + padding, 'base64');
      const payload = JSON.parse(buffer.toString('utf8'));

      if (typeof payload.index === 'number') {
        return payload;
      }

      return null;
    } catch (error) {
      logger.warn('Failed to decode pagination cursor', error);
      return null;
    }
  }
}

export default new AggregationService();
