# 🎥 Video Demo Recording Guide

## Recording Length: 1-2 minutes

## Equipment Needed
- Screen recording software (OBS Studio, Loom, or built-in screen recorder)
- Working microphone (optional but recommended)

## Preparation (Before Recording)

1. **Start the services**:
   ```powershell
   # Terminal 1: Start the server
   npm run dev
   
   # Wait for server to start (you should see the server banner)
   ```

2. **Open necessary windows**:
   - Terminal with server running
   - Browser with `http://localhost:3000`
   - Browser with `websocket-demo.html`
   - Postman with imported collection
   - Another terminal for demo script

3. **Test everything works**:
   ```powershell
   # Run demo script to verify
   .\demo.ps1
   ```

## Recording Script (1-2 minutes)

### Part 1: Introduction (15 seconds)
**What to show:**
- Terminal with server running
- Server banner showing port and configuration

**What to say:**
> "Hi! This is my real-time meme coin aggregator service. It fetches data from multiple DEX APIs, merges them intelligently, and provides live updates via WebSocket. Let me show you how it works."

### Part 2: API Demonstration (30 seconds)
**What to show:**
- Postman or terminal making API requests
- Run the demo script: `.\demo.ps1`
- Show response times in terminal

**What to say:**
> "First, let's test the REST API. I'm making rapid-fire requests to show the caching in action. Notice the first request takes around 500-1000ms as it fetches from external APIs, but cached requests respond in under 20ms - that's a 50x improvement!"

**Key points to highlight:**
- First request is slower (fetching from APIs)
- Subsequent requests are much faster (cached)
- Show different endpoints (filtering, sorting, pagination)

### Part 3: WebSocket Demo (30 seconds)
**What to show:**
- Open `websocket-demo.html` in browser
- Show connection status
- Show live updates coming in
- Maybe open in 2 browser tabs to show multi-client support

**What to say:**
> "Now for the real-time updates. This WebSocket connection automatically detects price changes over 1% and volume spikes over 50%, pushing updates to all connected clients instantly. You can see the live counters updating as new data comes in."

**Key points to highlight:**
- Connection status (green indicator)
- Update counters increasing
- Live token data with price changes
- Multiple browser tabs receiving updates

### Part 4: Architecture Overview (15 seconds)
**What to show:**
- Quick glimpse of code structure in VS Code (optional)
- Or show the README architecture diagram

**What to say:**
> "The system aggregates data from DexScreener, Jupiter, and GeckoTerminal APIs with intelligent rate limiting and exponential backoff. Redis provides sub-second caching, and Socket.io handles real-time distribution to connected clients."

### Closing (5 seconds)
**What to say:**
> "The complete source code, tests, documentation, and deployment configs are in the GitHub repo. Thanks for watching!"

## Recording Tips

### Screen Layout
1. **Option A - Split Screen**:
   ```
   ┌─────────────┬─────────────┐
   │  Terminal   │  Browser    │
   │  (Server)   │  (Demo)     │
   ├─────────────┼─────────────┤
   │  Postman    │  WebSocket  │
   │             │  Demo       │
   └─────────────┴─────────────┘
   ```

2. **Option B - Sequential**:
   - Show one thing at a time
   - Switch between windows smoothly

### Quality Checklist
- [ ] Audio is clear (no background noise)
- [ ] Screen resolution is readable (1080p minimum)
- [ ] Text in terminal is large enough to read
- [ ] Mouse movements are smooth and purposeful
- [ ] No personal information visible
- [ ] All services are working before recording

### Common Mistakes to Avoid
- ❌ Don't fumble with commands - have them ready in a script
- ❌ Don't explain code line-by-line - focus on functionality
- ❌ Don't record errors unless you're showing error handling
- ❌ Don't go over 2 minutes - keep it concise
- ❌ Don't show setup steps - only the working demo

## Recommended Recording Flow

### Take 1: Quick Run-through
1. Start server
2. Run demo script (`.\demo.ps1`)
3. Open WebSocket demo
4. Show updates happening

**Focus:** Speed and confidence

### Take 2: Detailed Version
1. Start server with explanation
2. Show API in Postman with various endpoints
3. Show caching improvement with metrics
4. Open WebSocket demo in multiple tabs
5. Show real-time updates with explanation

**Focus:** Technical depth

**Choose whichever take is better or combine the best parts!**

## Quick Demo Commands

```powershell
# Terminal 1: Start server
npm run dev

# Terminal 2: Run demo
.\demo.ps1

# Browser 1: API Root
http://localhost:3000

# Browser 2: WebSocket Demo
# Open websocket-demo.html

# Browser 3: Health Check
http://localhost:3000/api/health
```

## Post-Recording Checklist
- [ ] Video length is 1-2 minutes
- [ ] Audio is clear
- [ ] All features are demonstrated
- [ ] Response times are visible
- [ ] WebSocket updates are shown
- [ ] Video is uploaded to YouTube as public/unlisted
- [ ] YouTube link is added to README

## YouTube Upload Settings

**Title:** Meme Coin Real-Time Data Aggregator - Live Demo

**Description:**
```
Real-time meme coin data aggregation service built with TypeScript, Express, Socket.io, and Redis.

Features:
✅ Multi-source aggregation (DexScreener, Jupiter, GeckoTerminal)
✅ Intelligent token merging and deduplication
✅ Redis caching with 30s TTL (50x faster responses)
✅ Real-time WebSocket updates for price changes and volume spikes
✅ Rate limiting with exponential backoff
✅ Comprehensive filtering, sorting, and pagination

Tech Stack: Node.js, TypeScript, Express, Socket.io, Redis, Axios

GitHub: [Your GitHub Repo URL]
Live Demo: [Your Deployment URL]

Timestamps:
0:00 - Introduction
0:15 - REST API & Caching Demo
0:45 - WebSocket Real-Time Updates
1:15 - Architecture Overview
```

**Tags:** nodejs, typescript, websocket, redis, api, realtime, cryptocurrency, solana, dex

**Category:** Science & Technology

**Visibility:** Public or Unlisted (your choice)

## Example YouTube Videos for Reference
Look up these search terms for inspiration:
- "API demo real-time"
- "WebSocket demo"
- "Node.js REST API showcase"

## Troubleshooting During Recording

**Server not starting?**
- Check if port 3000 is available: `netstat -ano | findstr :3000`
- Kill process if needed: `taskkill /PID <pid> /F`

**Redis connection failed?**
- Start Redis: `docker run -d -p 6379:6379 redis:alpine`
- Or service will work without cache (will be slower)

**WebSocket not connecting?**
- Check server is running
- Check console for errors (F12)
- Try refreshing the page

**Slow API responses?**
- External APIs might be slow - that's okay, it shows caching benefit!
- Mention it: "First request fetching from external APIs..."

## Final Tips

1. **Practice first!** Do a dry run without recording
2. **Be enthusiastic** - show excitement about the features
3. **Keep moving** - don't pause too long between sections
4. **Show, don't just tell** - let the demo speak
5. **Have fun!** Your enthusiasm will show

Good luck with your recording! 🎬
