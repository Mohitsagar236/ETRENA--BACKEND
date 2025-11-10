export interface TokenData {
  token_address: string;
  token_name: string;
  token_ticker: string;
  price_sol: number;
  market_cap_sol: number;
  volume_sol: number;
  liquidity_sol: number;
  transaction_count: number;
  price_1hr_change: number;
  price_24hr_change?: number;
  price_7d_change?: number;
  protocol: string;
  sources: string[];
  last_updated: number;
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  txns: {
    h1?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  volume: {
    h1?: number;
    h24?: number;
  };
  priceChange: {
    h1?: number;
    h24?: number;
    d7?: number;
    w1?: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
}

export interface JupiterPriceData {
  data: {
    [key: string]: {
      id: string;
      mintSymbol: string;
      vsToken: string;
      vsTokenSymbol: string;
      price: number;
    };
  };
  timeTaken: number;
}

export interface GeckoTerminalToken {
  id: string;
  type: string;
  attributes: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
    price_usd: string;
    fdv_usd: string;
    total_reserve_in_usd: string;
    volume_usd: {
      h24: string;
    };
    market_cap_usd: string;
  };
}

export interface PaginationParams {
  limit: number;
  cursor?: string;
}

export interface FilterParams {
  timePeriod?: '1h' | '24h' | '7d';
  sortBy?: 'volume' | 'price_change' | 'market_cap' | 'liquidity';
  sortOrder?: 'asc' | 'desc';
  minVolume?: number;
  minMarketCap?: number;
}

export interface TokenListResponse {
  tokens: TokenData[];
  nextCursor?: string;
  total: number;
  timestamp: number;
}

export interface WebSocketUpdate {
  type: 'price_update' | 'volume_spike' | 'new_token';
  data: TokenData | TokenData[];
  timestamp: number;
}

export interface CacheConfig {
  ttl: number;
  prefix: string;
}

export interface RateLimiter {
  requestsPerMinute: number;
  currentRequests: number;
  resetTime: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}
