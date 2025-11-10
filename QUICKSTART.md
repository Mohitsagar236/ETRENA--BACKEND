# 🚀 Quick Start Guide

Welcome! This guide will get you up and running in 5 minutes.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed ([Download](https://nodejs.org/))
- ✅ npm or yarn package manager
- ✅ Git installed
- ✅ Redis (optional, can use Docker)

## Quick Start (Automated)

### Windows (PowerShell)
```powershell
# Run the setup script
.\setup.ps1

# Start development server
npm run dev

# In a new terminal, run demo
.\demo.ps1
```

### macOS/Linux (Bash)
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start Redis with Docker
docker run -d -p 6379:6379 --name meme-coin-redis redis:alpine

# Build the project
npm run build

# Start development server
npm run dev
```

## Manual Setup (Step-by-Step)

### Step 1: Install Dependencies
```bash
npm install
```

This installs all required packages:
- express (web framework)
- socket.io (WebSocket)
- ioredis (Redis client)
- axios (HTTP client)
- typescript, ts-node (TypeScript)
- jest (testing)
- winston (logging)

### Step 2: Configure Environment

Create `.env` file:
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development):
```env
PORT=3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
CACHE_TTL=30
```

### Step 3: Start Redis

**Option A: Docker (Recommended)**
```bash
docker run -d -p 6379:6379 --name meme-coin-redis redis:alpine
```

**Option B: Local Redis**
```bash
# Windows (WSL)
sudo service redis-server start

# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

**Option C: Cloud Redis (Free)**
- [Upstash](https://upstash.com/) - Free tier available
- [Redis Cloud](https://redis.com/try-free/) - Free tier available

If using cloud Redis, update `REDIS_URL` in `.env`.

### Step 4: Build the Project
```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### Step 5: Start the Server

**Development Mode (with hot-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════╗
║  Meme Coin Aggregator Service                     ║
║  Port: 3000                                       ║
║  Environment: development                         ║
║  WebSocket: Enabled                               ║
║  Cache TTL: 30s                                   ║
╚═══════════════════════════════════════════════════╝
Server is running and ready to accept connections
```

## Testing the Installation

### 1. Test Basic Connectivity
Open browser to: http://localhost:3000

You should see:
```json
{
  "message": "Meme Coin Aggregator API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### 2. Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```

### 3. Test Token Endpoint
```bash
curl "http://localhost:3000/api/tokens?limit=5"
```

### 4. Test WebSocket
Open `websocket-demo.html` in your browser.

### 5. Run Automated Demo
```bash
# Windows
.\demo.ps1

# macOS/Linux
npm test  # Run test suite instead
```

## Common Issues & Solutions

### Issue: Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

Or change `PORT` in `.env` to a different port.

### Issue: Redis connection failed
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not running, start Redis:
docker run -d -p 6379:6379 redis:alpine
```

The service will work without Redis (just slower), so you can continue.

### Issue: Module not found
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript compilation errors
```bash
# Clean build
rm -rf dist
npm run build
```

### Issue: Tests failing
```bash
# Make sure server is not running
# Then run tests
npm test
```

## Project Structure Overview

```
ETRANE_BACK/
├── src/
│   ├── config/              # Configuration
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic & API clients
│   ├── routes/              # API routes
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   ├── __tests__/           # Tests
│   └── server.ts            # Entry point
├── dist/                    # Compiled output
├── logs/                    # Log files
├── .env                     # Your config
├── package.json             # Dependencies
└── README.md                # Full documentation
```

## Next Steps

### 1. Explore the API
- Import `postman_collection.json` into Postman
- Try different endpoints and parameters
- Check response times

### 2. Watch Real-Time Updates
- Open `websocket-demo.html` in multiple browser tabs
- Watch live updates flowing in
- See price changes and volume spikes

### 3. Run Tests
```bash
npm test
```

### 4. Read Documentation
- `README.md` - Full API documentation
- `DEVELOPMENT.md` - Development guide
- `VIDEO_GUIDE.md` - Video recording guide

### 5. Deploy (Optional)
- See README.md for deployment instructions
- Deploy to Render, Railway, or your platform
- Update `.env` with production settings

## Available Commands

```bash
# Development
npm run dev              # Start with hot-reload
npm run build            # Build TypeScript
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode

# Scripts (Windows)
.\setup.ps1              # Automated setup
.\demo.ps1               # Run demo tests
```

## Getting Help

If you encounter issues:

1. **Check logs**: `logs/error.log` and `logs/combined.log`
2. **Review documentation**: README.md, DEVELOPMENT.md
3. **Run health check**: `curl http://localhost:3000/api/health`
4. **Check Redis**: `redis-cli ping`
5. **Verify environment**: Check `.env` file

## Performance Tips

### First Request is Slow
This is normal! The first request fetches from external APIs (500-2000ms). Subsequent requests use cache and are much faster (5-20ms).

### Improve Response Times
- Ensure Redis is running (provides caching)
- Increase `CACHE_TTL` for longer cache (default 30s)
- Check your internet connection (external APIs)

### WebSocket Updates
- Updates occur every 5 seconds (configurable via `WS_UPDATE_INTERVAL`)
- Only broadcasts when changes detected (>1% price or >50% volume)

## Development Workflow

### Making Changes
1. Edit files in `src/`
2. Server auto-reloads (if using `npm run dev`)
3. Test changes via API or WebSocket
4. Run tests: `npm test`
5. Commit changes

### Adding Features
See `DEVELOPMENT.md` for detailed guide on:
- Adding new API clients
- Creating new endpoints
- Writing tests
- Best practices

## Production Deployment

When ready to deploy:

1. Set environment variables:
   ```env
   NODE_ENV=production
   REDIS_URL=<your-production-redis-url>
   LOG_LEVEL=info
   ```

2. Build and start:
   ```bash
   npm run build
   npm start
   ```

3. Or deploy to a platform:
   - **Render**: Push to GitHub, connect repo
   - **Railway**: `railway up`
   - **Docker**: `docker-compose up -d`

See README.md "Deployment" section for details.

## Success Checklist

You're ready when:
- ✅ Server starts without errors
- ✅ Health check returns status 200
- ✅ Token endpoint returns data
- ✅ WebSocket demo shows live updates
- ✅ Tests pass (`npm test`)
- ✅ Demo script runs successfully

## Congratulations! 🎉

You're all set! Your meme coin aggregator is running and ready to:
- Aggregate data from multiple DEX sources
- Serve cached responses in milliseconds
- Stream real-time updates via WebSocket
- Handle thousands of requests

**Next**: Record your demo video following `VIDEO_GUIDE.md`

Happy coding! 🚀
