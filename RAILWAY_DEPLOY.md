# 🚂 Railway Deployment Guide

## Quick Deploy to Railway

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

---

## Option 1: Deploy via Railway Dashboard (Recommended - No CLI needed)

### Step 1: Push to GitHub

```powershell
# If not already a git repository
git init
git add .
git commit -m "Deploy to Railway"

# Push to GitHub
git remote add origin https://github.com/Mohitsagar236/ETRENA--BACKEND.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `Mohitsagar236/ETRENA--BACKEND`
6. **Railway will auto-detect** the Node.js project

### Step 3: Add Redis Service

1. In your Railway project, click **"+ New"**
2. Select **"Database" → "Add Redis"**
3. Railway will automatically create a Redis instance
4. The `REDIS_URL` will be automatically available as an environment variable

### Step 4: Configure Environment Variables

Railway should auto-detect most variables, but verify these are set:

Go to your service → **Variables** tab:

```
PORT=3000
NODE_ENV=production
CACHE_TTL=30
LOG_LEVEL=info
WS_UPDATE_INTERVAL=5000
DEXSCREENER_RATE_LIMIT=300
JUPITER_RATE_LIMIT=600
GECKOTERMINAL_RATE_LIMIT=300
```

**Note**: `REDIS_URL` is automatically set by Railway when you add Redis.

### Step 5: Deploy

1. Railway will **automatically deploy** after connecting the repo
2. Wait for build to complete (2-3 minutes)
3. Check the **Deployments** tab for status

### Step 6: Get Your Public URL

1. Go to **Settings** tab
2. Scroll to **Networking** section
3. Click **"Generate Domain"**
4. Copy your public URL (e.g., `https://your-app.railway.app`)

### Step 7: Test Deployment

```powershell
# Replace with your Railway URL
curl https://your-app.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": 1699632000000,
  "uptime": 10.5,
  "redis": true,
  "websocket": {
    "connected": 0
  }
}
```

---

## Option 2: Deploy via Railway CLI

### Step 1: Install Railway CLI

```powershell
# Using npm
npm install -g @railway/cli

# Or using PowerShell (as admin)
iwr https://railway.app/install.ps1 | iex
```

### Step 2: Login to Railway

```powershell
railway login
```

This will open a browser for authentication.

### Step 3: Initialize Railway Project

```powershell
# Navigate to project directory
cd "C:\Users\cp813\Desktop\ETRANE BACK"

# Initialize Railway project
railway init
```

Select: **"Create new project"** and give it a name.

### Step 4: Add Redis

```powershell
# Link to your project
railway link

# Add Redis plugin
railway add redis
```

### Step 5: Set Environment Variables

```powershell
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set CACHE_TTL=30
railway variables set LOG_LEVEL=info
railway variables set WS_UPDATE_INTERVAL=5000
```

### Step 6: Deploy

```powershell
railway up
```

### Step 7: Get Deployment URL

```powershell
railway domain
```

Or generate a new domain:
```powershell
railway domain generate
```

---

## Post-Deployment Checklist

### 1. Verify Health Endpoint
```powershell
curl https://your-app.railway.app/api/health
```

### 2. Test API Endpoints
```powershell
# Get tokens
curl "https://your-app.railway.app/api/tokens?limit=5"

# Get metrics
curl https://your-app.railway.app/api/metrics
```

### 3. Test WebSocket Connection

Update `websocket-demo.html`:
```javascript
// Change this line:
const socket = io('http://localhost:3000');

// To:
const socket = io('https://your-app.railway.app');
```

Open in browser and check for real-time updates.

### 4. Monitor Logs

**Via Dashboard:**
- Go to your Railway project
- Click on your service
- View **Logs** tab

**Via CLI:**
```powershell
railway logs
```

---

## Railway Configuration Files

Railway automatically detects:
- ✅ `package.json` - for dependencies
- ✅ `railway.json` - for build/deploy config (included)
- ✅ `tsconfig.json` - for TypeScript compilation
- ✅ Node.js version from `package.json` engines field

---

## Environment Variables on Railway

Railway automatically provides:
- `REDIS_URL` - When you add Redis service
- `PORT` - Railway assigns this (usually 3000)
- `RAILWAY_ENVIRONMENT` - Current environment
- `RAILWAY_PROJECT_ID` - Project identifier
- `RAILWAY_SERVICE_ID` - Service identifier

You need to set:
- `NODE_ENV=production`
- `CACHE_TTL=30`
- `LOG_LEVEL=info`
- `WS_UPDATE_INTERVAL=5000`
- Rate limit variables

---

## Troubleshooting

### Build Fails

**Check build logs:**
```powershell
railway logs --deployment
```

**Common fixes:**
- Ensure `package.json` has `"build": "tsc"`
- Ensure `"start": "node dist/server.js"`
- Check `engines.node` specifies `>=18.0.0`

### Service Won't Start

**Check runtime logs:**
```powershell
railway logs
```

**Common issues:**
- Missing environment variables
- Redis connection issues (ensure Redis service is added)
- Port binding (Railway provides PORT automatically)

### Redis Connection Issues

**Verify Redis is added:**
```powershell
railway variables
```

Look for `REDIS_URL` in the output.

**Add Redis if missing:**
```powershell
railway add redis
```

### Health Check Failing

**Check endpoint:**
```powershell
curl https://your-app.railway.app/api/health
```

**Update railway.json if needed:**
```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100
  }
}
```

---

## Cost Information

**Railway Free Tier:**
- ✅ $5 free credit per month
- ✅ Includes Redis
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Enough for this project

**Estimated Usage:**
- Web Service: ~$2-3/month
- Redis: ~$1-2/month
- Total: Well within free tier

---

## Update README.md After Deployment

Add this to your README.md:

```markdown
## 🌐 Live Demo

- **API Base URL**: https://your-app.railway.app
- **Health Check**: https://your-app.railway.app/api/health
- **API Endpoints**: https://your-app.railway.app/api/tokens
- **WebSocket**: wss://your-app.railway.app

### Example Requests:

```bash
# Get tokens
curl "https://your-app.railway.app/api/tokens?limit=10&sortBy=volume"

# Get health status
curl https://your-app.railway.app/api/health

# Get specific token
curl https://your-app.railway.app/api/tokens/YOUR_TOKEN_ADDRESS
```
```

---

## Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Test WebSocket connection
3. ✅ Update README.md with Railway URL
4. ✅ Record demo video showing live deployment
5. ✅ Update COMPLETION_REPORT.md with deployment URL

---

## Useful Railway Commands

```powershell
# View logs
railway logs

# View environment variables
railway variables

# Open project in browser
railway open

# Check deployment status
railway status

# Rollback to previous deployment
railway rollback

# Delete service
railway down
```

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

**Your app is ready to deploy! Follow Option 1 (Dashboard) for the easiest deployment.** 🚀
