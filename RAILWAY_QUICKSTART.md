# 🚀 Quick Railway Deployment Cheat Sheet

## Fastest Way to Deploy (No CLI)

### Step 1: Push to GitHub
```powershell
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Deploy on Railway Dashboard
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Mohitsagar236/ETRENA--BACKEND`
4. Click "+ New" → "Database" → "Add Redis"
5. Go to "Settings" → "Networking" → "Generate Domain"
6. Done! 🎉

---

## With Railway CLI

### One-Time Setup
```powershell
# Install Railway CLI (run as admin)
npm install -g @railway/cli

# Login
railway login
```

### Deploy Commands
```powershell
# Navigate to project
cd "C:\Users\cp813\Desktop\ETRANE BACK"

# Initialize project
railway init

# Add Redis
railway add redis

# Set environment variables
railway variables set NODE_ENV=production
railway variables set CACHE_TTL=30
railway variables set LOG_LEVEL=info
railway variables set WS_UPDATE_INTERVAL=5000

# Deploy
railway up

# Get your URL
railway domain
```

### Useful Commands
```powershell
# View logs
railway logs

# Check status
railway status

# Open in browser
railway open

# View all variables
railway variables

# Redeploy
railway up
```

---

## Using the Automated Script

```powershell
# Run the deployment script
.\deploy-railway.ps1
```

This script will:
- ✅ Check prerequisites
- ✅ Help you choose deployment method
- ✅ Push to GitHub (if needed)
- ✅ Deploy to Railway
- ✅ Configure Redis
- ✅ Set environment variables
- ✅ Generate domain

---

## After Deployment

### Test Your Deployment
```powershell
# Get your Railway URL
$url = railway domain

# Test health endpoint
curl "$url/api/health"

# Test API
curl "$url/api/tokens?limit=5"
```

### Update README
Replace in README.md:
```markdown
- **API Base URL**: `https://your-actual-url.railway.app`
```

### Monitor Your App
```powershell
# View real-time logs
railway logs

# Check metrics on dashboard
railway open
```

---

## Environment Variables Set by Railway

Railway automatically provides:
- ✅ `REDIS_URL` (when you add Redis)
- ✅ `PORT` (Railway assigns)
- ✅ `RAILWAY_ENVIRONMENT`

You set:
- `NODE_ENV=production`
- `CACHE_TTL=30`
- `LOG_LEVEL=info`
- `WS_UPDATE_INTERVAL=5000`

---

## Troubleshooting

### Build Fails
```powershell
# Check logs
railway logs --deployment

# Ensure package.json has correct scripts
npm run build  # Should work locally first
```

### Can't Connect
```powershell
# Verify domain is generated
railway domain

# Check health endpoint
curl https://your-url.railway.app/api/health
```

### Redis Issues
```powershell
# Verify Redis is added
railway variables | Select-String "REDIS"

# Add if missing
railway add redis
```

---

## Cost

**Railway Free Tier:**
- $5 credit/month
- Enough for this project
- Includes Redis
- Auto HTTPS
- Custom domains

---

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Test endpoints
3. ✅ Update README with URL
4. ✅ Record demo video
5. ✅ Submit project

---

**Quick Deploy:** Just run `.\deploy-railway.ps1` and follow the prompts! 🚀
