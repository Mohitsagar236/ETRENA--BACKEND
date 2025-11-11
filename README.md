# 🚀 Meme Coin Real-Time Data Aggregator

A high-performance, real-time data aggregation service that fetches, merges, and streams meme coin data from multiple DEX sources. Built with TypeScript, Express, Socket.io, and Redis.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌐 Live Demo

> **� Deployed on Railway**

- **API Base URL**: `https://your-app.railway.app` _(Update after deployment)_
- **Health Check**: `https://your-app.railway.app/api/health`
- **API Docs**: `https://your-app.railway.app/api/tokens`
- **WebSocket**: `wss://your-app.railway.app`

### Quick Test:
```bash
# Test health endpoint
curl https://your-app.railway.app/api/health

# Get tokens
curl "https://your-app.railway.app/api/tokens?limit=10&sortBy=volume"
```

## �📋 Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [Testing](#testing)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)

## ✨ Features

### Core Capabilities

- **Multi-Source Aggregation**: Fetches DexScreener and GeckoTerminal data with optional Jupiter enrichment when available
- **Intelligent Merging**: Deduplicates tokens from multiple sources and merges data intelligently
- **Comprehensive Metrics**: Surfaces 1h/24h/7d price changes with fallback logic across providers
- **Real-Time Updates**: WebSocket support for live price updates and volume spikes
- **Smart Caching**: Redis-based caching with configurable TTL (default 30s) plus resilient in-memory fallback
- **Rate Limiting**: Exponential backoff and per-API rate limiting
- **Filtering & Sorting**: Support for multiple filter criteria and sorting options
- **Cursor-Based Pagination**: Opaque base64 cursors for efficient, tamper-resistant pagination
- **Error Recovery**: Automatic retry with exponential backoff
- **Performance Monitoring**: Response time tracking and health metrics

### API Endpoints

- `GET /api/tokens` - List tokens with filtering, sorting, and pagination
- `GET /api/tokens/:address` - Get specific token details
- `GET /api/health` - Health check with system metrics
- `GET /api/metrics` - Aggregated token metrics
- `POST /api/cache/refresh` - Manually refresh cache

## 🏗️ Architecture

### System Design

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├─── HTTP/REST ───┐
       │                 │
       └─── WebSocket ───┼──┐
                         │  │
                    ┌────▼──▼─────┐
                    │   Express   │
                    │   Server    │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
    ┌───────▼───────┐ ┌───▼────┐ ┌──────▼──────┐
    │  Aggregation  │ │ Cache  │ │  WebSocket  │
    │   Service     │ │ (Redis)│ │   Service   │
    └───────┬───────┘ └────────┘ └─────────────┘
            │
    ┌───────┼───────┐
    │       │       │
┌───▼──┐ ┌──▼───┐ ┌▼────────┐
│ Dex  │ │Jupiter│ │  Gecko  │
│Screen│ │  API  │ │Terminal │
└──────┘ └───────┘ └─────────┘
```

### Key Components

#### 1. **API Clients** (`src/services/*.client.ts`)
- **DexScreener Client**: Fetches token pairs and search results
- **Jupiter Client**: Provides price data enrichment
- **GeckoTerminal Client**: Fetches trending tokens and network data
- Each client includes:
  - Rate limiting (300-600 req/min based on API)
  - Exponential backoff retry logic
  - Error handling and logging

#### 2. **Aggregation Service** (`src/services/aggregation.service.ts`)
- Fetches data from multiple sources in parallel
- Intelligently merges duplicate tokens
- Optionally enriches datasets with Jupiter prices when the integration is enabled
- Tracks multi-period price change metrics with provider-aware fallbacks
- Implements filtering, sorting, and opaque cursor pagination
- Caches results with configurable TTL

#### 3. **Cache Service** (`src/services/cache.service.ts`)
- Redis-based caching with ioredis
- Automatic connection retry
- Pattern-based cache invalidation
- Error-tolerant (degrades gracefully if Redis unavailable)
- In-memory fallback mirrors Redis semantics (TTL + wildcard eviction) when Redis is offline

#### 4. **WebSocket Service** (`src/services/websocket.service.ts`)
- Socket.io for real-time communication
- Periodic data updates (configurable interval)
- Detects price changes and volume spikes
- Room-based subscriptions
- Broadcasts updates to connected clients

#### 5. **Rate Limiter** (`src/utils/rateLimiter.ts`)
- Per-API rate limiting
- Request queuing for over-limit requests
- Exponential backoff utility function
- Status monitoring

## 📦 Installation

### Prerequisites

- Node.js 18+
- Redis (local or cloud)
- npm or yarn

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ETRANE_BACK
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Redis** (if running locally)
   ```bash
   # Windows (via WSL or Docker)
   docker run -d -p 6379:6379 redis:alpine
   
   # macOS
   brew services start redis
   
   # Linux
   sudo systemctl start redis
   ```

5. **Run in development mode**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379
CACHE_TTL=30

# API Rate Limiting
DEXSCREENER_RATE_LIMIT=300
JUPITER_RATE_LIMIT=600
GECKOTERMINAL_RATE_LIMIT=300

# WebSocket Configuration
WS_UPDATE_INTERVAL=5000

# Logging
LOG_LEVEL=info
```

> **Note**: Jupiter enrichment is optional. If the Jupiter client is disabled or rate limited, the service continues to operate using DexScreener and GeckoTerminal data.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Get Tokens List

```http
GET /api/tokens
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `timePeriod` | string | Filter by time: `1h`, `24h`, `7d` | `24h` |
| `sortBy` | string | Sort by: `volume`, `price_change`, `market_cap`, `liquidity` | `volume` |
| `sortOrder` | string | Order: `asc`, `desc` | `desc` |
| `minVolume` | number | Minimum volume filter | - |
| `minMarketCap` | number | Minimum market cap filter | - |
| `limit` | number | Page size (max 100) | `20` |
| `cursor` | string | Pagination cursor | - |

**Example Request:**
```bash
curl "http://localhost:3000/api/tokens?sortBy=volume&sortOrder=desc&limit=20"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "token_address": "576P1t7XsRL4ZVj38LV2eYWxXRPguBADA8BxcNz1xo8y",
        "token_name": "PIPE CTO",
        "token_ticker": "PIPE",
        "price_sol": 4.4141209798877615e-7,
        "market_cap_sol": 441.41,
        "volume_sol": 1322.43,
        "liquidity_sol": 149.36,
        "transaction_count": 2205,
        "price_1hr_change": 120.61,
        "price_24hr_change": 85.23,
        "protocol": "Raydium CLMM",
        "sources": ["DexScreener", "Jupiter"],
        "last_updated": 1699632000000
      }
    ],
    "nextCursor": "20",
    "total": 50,
    "timestamp": 1699632000000
  },
  "timestamp": 1699632000000
}
```

#### 2. Get Token by Address

```http
GET /api/tokens/:address
```

**Example Request:**
```bash
curl "http://localhost:3000/api/tokens/576P1t7XsRL4ZVj38LV2eYWxXRPguBADA8BxcNz1xo8y"
```

#### 3. Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1699632000000,
  "uptime": 3600.5,
  "redis": true,
  "websocket": {
    "connected": 5
  },
  "rateLimiters": {
    "dexScreener": {
      "name": "DexScreener",
      "currentRequests": 45,
      "limit": 300,
      "queueSize": 0
    }
  }
}
```

#### 4. Get Metrics

```http
GET /api/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTokens": 50,
    "averageVolume": 850.25,
    "averageMarketCap": 5000.75,
    "topGainers": [
      { "ticker": "PIPE", "change": 120.61 }
    ],
    "topVolume": [
      { "ticker": "BONK", "volume": 5000.5 }
    ]
  }
}
```

#### 5. Refresh Cache

```http
POST /api/cache/refresh
```

## 🔌 WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:3000');
```

### Events

#### Subscribe to Updates
```javascript
socket.emit('subscribe', { tokens: ['addr1', 'addr2'] });
```

#### Initial Data
```javascript
socket.on('initial_data', (data) => {
  console.log('Initial tokens:', data.data);
});
```

#### Real-Time Updates
```javascript
socket.on('update', (update) => {
  switch(update.type) {
    case 'price_update':
      console.log('Price updated:', update.data);
      break;
    case 'volume_spike':
      console.log('Volume spike detected:', update.data);
      break;
    case 'new_token':
      console.log('New token added:', update.data);
      break;
  }
});
```

### WebSocket Update Types

1. **price_update**: Sent when token price changes >1%
2. **volume_spike**: Sent when volume increases >50%
3. **new_token**: Sent when new tokens are discovered

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Test Categories

1. **Unit Tests** (`src/__tests__/utils/`, `src/__tests__/services/`)
   - Rate limiter functionality
   - Cache operations
   - Token aggregation logic
   - Filtering and sorting

2. **Integration Tests** (`src/__tests__/integration/`)
   - API endpoint testing
   - Request/response validation
   - Error handling

### Test Coverage

- Rate Limiter: Request queuing, status tracking, backoff logic
- Cache Service: Set/get/delete operations, pattern matching
- Aggregation Service: Filtering, sorting, pagination, merging
- API Routes: All endpoints with happy paths and error cases

## 🚀 Deployment

### Quick Deploy to Railway (Recommended)

**Option 1: Via Railway Dashboard (No CLI needed)**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Railway"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [Railway](https://railway.app) and sign in with GitHub
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Select repository: `Mohitsagar236/ETRENA--BACKEND`
   - Railway auto-detects Node.js project

3. **Add Redis**
   - Click **"+ New"** → **"Database"** → **"Add Redis"**
   - Railway automatically sets `REDIS_URL`

4. **Generate Domain**
   - Go to **Settings** → **Networking** → **"Generate Domain"**
   - Get your public URL (e.g., `https://your-app.railway.app`)

5. **Done!** Your app is live 🎉

**Option 2: Via Railway CLI**

```powershell
# Quick deploy using the automated script
.\deploy-railway.ps1

# Or manually:
npm i -g @railway/cli
railway login
railway init
railway add redis
railway up
railway domain
```

📖 **Full Railway Guide**: See [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) for detailed instructions

### Deploying to Render

1. **Create Account**: Go to [Render Dashboard](https://dashboard.render.com)
2. **New Web Service**: Connect your GitHub repository
3. **Auto-Detection**: Render uses `render.yaml` configuration
4. **Add Redis**: Create Redis instance from dashboard
5. **Deploy**: Render builds and deploys automatically

📖 **Configuration**: See `render.yaml` for settings

### Deploying with Docker

```bash
# Build and run locally
docker-compose up -d

# Or deploy to any Docker-compatible platform
docker build -t meme-coin-aggregator .
docker run -d -p 3000:3000 --env-file .env meme-coin-aggregator
```

### Environment Variables (Production)

Set these in your hosting platform:

```env
NODE_ENV=production
PORT=3000
REDIS_URL=<your-redis-url>
CACHE_TTL=30
LOG_LEVEL=info
WS_UPDATE_INTERVAL=5000
DEXSCREENER_RATE_LIMIT=300
JUPITER_RATE_LIMIT=600
GECKOTERMINAL_RATE_LIMIT=300
```

**Note**: Railway and Render provide `REDIS_URL` automatically when you add Redis service.

## 🎯 Design Decisions

### 1. **Multi-Source Aggregation**
- **Why**: Single API sources may have incomplete data or rate limits
- **How**: Parallel fetching with Promise.allSettled for fault tolerance
- **Benefit**: More comprehensive data with fallback options

### 2. **Intelligent Token Merging**
- **Why**: Same token appears on multiple DEXs
- **Strategy**: Use token address as unique key, merge by taking max values for volume/liquidity
- **Benefit**: Eliminates duplicates while preserving best data

### 3. **Redis Caching with 30s TTL**
- **Why**: Balance between data freshness and API rate limits
- **Strategy**: Cache aggregated results, invalidate on-demand
- **Benefit**: 10-50x faster response times for cached data

### 4. **WebSocket for Real-Time Updates**
- **Why**: More efficient than polling for live data
- **Strategy**: Periodic checks (5s) with change detection
- **Benefit**: Instant updates with minimal overhead

### 5. **Rate Limiting & Exponential Backoff**
- **Why**: Respect API limits and handle transient failures
- **Strategy**: Per-API rate limiters with request queuing
- **Benefit**: Reliable operation within API constraints

### 6. **Cursor-Based Pagination**
- **Why**: Efficient for large datasets, consistent results
- **Strategy**: Opaque base64 cursor encoding filters and position
- **Benefit**: Better performance than offset-based pagination with tamper resistance

### 7. **Error-Tolerant Architecture**
- **Why**: Individual API failures shouldn't crash the service
- **Strategy**: Try-catch blocks, Promise.allSettled, graceful degradation
- **Benefit**: High availability even with partial failures

### 8. **TypeScript with Strict Mode**
- **Why**: Type safety prevents runtime errors
- **Strategy**: Comprehensive interfaces and type definitions
- **Benefit**: Better developer experience and fewer bugs

## 📊 Performance Considerations

### Response Times

- **Cached requests**: 5-20ms
- **Uncached requests**: 500-2000ms (depending on API response times)
- **WebSocket updates**: <10ms latency

### Optimizations

1. **Parallel API Calls**: Fetch from multiple sources simultaneously
2. **Selective Caching**: Cache aggregated results, not individual API responses
3. **Efficient Merging**: O(n) token merging with Map-based deduplication
4. **Lazy Loading**: Only enrich with Jupiter prices when enabled and beneficial

### Scalability

- **Horizontal Scaling**: Stateless design allows multiple instances
- **Redis Clustering**: Support for Redis Cluster in production
- **Rate Limiter**: Per-instance rate limiting prevents API overload
- **WebSocket Rooms**: Efficient broadcasting to subscribed clients

## 📝 API Rate Limits

| API | Limit | Strategy |
|-----|-------|----------|
| DexScreener | 300 req/min | Queue excess requests |
| Jupiter | 600 req/min | Batch token lookups |
| GeckoTerminal | 300 req/min | Cache trending tokens |

## 🔍 Monitoring & Logging

### Log Levels

- **error**: Critical failures
- **warn**: Recoverable issues
- **info**: Important events (requests, cache updates)
- **debug**: Detailed debugging information

### Health Metrics

- System uptime
- Redis connection status
- WebSocket client count
- Rate limiter status
- Response times (via headers)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review API examples in Postman collection

---

**Built with ❤️ for the meme coin community**
