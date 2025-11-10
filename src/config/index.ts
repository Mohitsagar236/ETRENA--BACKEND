import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    cacheTTL: parseInt(process.env.CACHE_TTL || '30', 10),
  },
  
  rateLimits: {
    dexScreener: parseInt(process.env.DEXSCREENER_RATE_LIMIT || '300', 10),
    jupiter: parseInt(process.env.JUPITER_RATE_LIMIT || '600', 10),
    geckoTerminal: parseInt(process.env.GECKOTERMINAL_RATE_LIMIT || '300', 10),
  },
  
  websocket: {
    updateInterval: parseInt(process.env.WS_UPDATE_INTERVAL || '5000', 10),
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  apis: {
    dexScreener: 'https://api.dexscreener.com/latest/dex',
    jupiter: 'https://api.jup.ag/price/v2',
    geckoTerminal: 'https://api.geckoterminal.com/api/v2',
  },
  
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};
