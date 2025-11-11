# 🎯 Railway Deployment - Step-by-Step Guide

**Status:** Ready to Deploy ✅  
**Method:** Railway (Recommended)  
**Time Required:** 5-10 minutes

---

## ✅ Pre-Deployment Checklist

- [x] Code complete and tested
- [x] Railway configuration files created
- [x] Git repository initialized
- [x] GitHub repository connected
- [x] Environment variables documented
- [x] Health endpoint available

---

## 🚀 Deployment Steps

### Option A: Railway Dashboard (RECOMMENDED - Easiest)

No CLI installation required!

#### Step 1: Commit and Push to GitHub
```powershell
# Add all new files
git add .

# Commit changes
git commit -m "feat: Add Railway deployment configuration"

# Push to GitHub
git push origin master
```

#### Step 2: Deploy on Railway
1. **Open Railway**: Go to https://railway.app
2. **Sign In**: Use your GitHub account (Mohitsagar236)
3. **New Project**: Click "New Project"
4. **Deploy from GitHub**: Select "Deploy from GitHub repo"
5. **Select Repository**: Choose `ETRENA--BACKEND`
6. **Auto-Deploy**: Railway will automatically detect and deploy your Node.js app

#### Step 3: Add Redis Database
1. In your Railway project dashboard
2. Click **"+ New"** button
3. Select **"Database"**
4. Choose **"Add Redis"**
5. Railway will automatically:
   - Create a Redis instance
   - Set the `REDIS_URL` environment variable
   - Connect it to your service

#### Step 4: Configure Environment Variables
1. Click on your web service
2. Go to **"Variables"** tab
3. Verify these are set (Railway may auto-detect some):
   ```
   NODE_ENV=production
   PORT=3000
   CACHE_TTL=30
   LOG_LEVEL=info
   WS_UPDATE_INTERVAL=5000
   DEXSCREENER_RATE_LIMIT=300
   JUPITER_RATE_LIMIT=600
   GECKOTERMINAL_RATE_LIMIT=300
   ```
4. `REDIS_URL` should be automatically set by Railway

#### Step 5: Generate Public Domain
1. In your service, go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy your public URL (e.g., `https://etrena-backend-production.up.railway.app`)

#### Step 6: Wait for Deployment
- Monitor the **"Deployments"** tab
- Build time: ~2-3 minutes
- Look for "Success" status

#### Step 7: Test Your Deployment
```powershell
# Replace with your actual Railway URL
$railwayUrl = "https://your-app.railway.app"

# Test health endpoint
curl "$railwayUrl/api/health"

# Test API
curl "$railwayUrl/api/tokens?limit=5"
```

---

### Option B: Automated Script (Quick)

Run the automated deployment script:

```powershell
# Execute deployment script
.\deploy-railway.ps1
```

The script will:
1. Check if Railway CLI is installed
2. Offer to use Dashboard method or install CLI
3. Guide you through GitHub push
4. Provide next steps

---

### Option C: Railway CLI (For Developers)

#### One-Time Setup
```powershell
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login
```

#### Deploy Your App
```powershell
# Navigate to project directory
cd "C:\Users\cp813\Desktop\ETRANE BACK"

# Initialize Railway project
railway init
# Choose: "Create new project"
# Name: "meme-coin-aggregator" (or your preference)

# Link to the project
railway link

# Add Redis service
railway add redis

# Set environment variables
railway variables set NODE_ENV=production
railway variables set CACHE_TTL=30
railway variables set LOG_LEVEL=info
railway variables set WS_UPDATE_INTERVAL=5000
railway variables set DEXSCREENER_RATE_LIMIT=300
railway variables set JUPITER_RATE_LIMIT=600
railway variables set GECKOTERMINAL_RATE_LIMIT=300

# Deploy
railway up

# Generate domain
railway domain
```

---

## 🧪 Post-Deployment Testing

### 1. Health Check
```powershell
# Test health endpoint
curl https://your-app.railway.app/api/health
```

**Expected Response:**
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

### 2. API Test
```powershell
# Get tokens
curl "https://your-app.railway.app/api/tokens?limit=5&sortBy=volume"
```

### 3. WebSocket Test
Update `websocket-demo.html`:
```javascript
// Change line ~15
const socket = io('https://your-app.railway.app');
```

Open in browser and verify real-time updates.

### 4. Performance Test
Use Postman collection:
1. Import `postman_collection.json`
2. Set `base_url` to your Railway URL
3. Run the collection
4. Verify response times

---

## 📊 Monitor Your Deployment

### Via Railway Dashboard
1. Go to https://railway.app
2. Select your project
3. View:
   - **Deployments**: Build and deploy history
   - **Logs**: Real-time application logs
   - **Metrics**: CPU, Memory, Network usage
   - **Variables**: Environment configuration

### Via Railway CLI
```powershell
# View real-time logs
railway logs

# Check deployment status
railway status

# Open project in browser
railway open

# View environment variables
railway variables
```

---

## 📝 Update Documentation

After successful deployment, update these files:

### 1. README.md
Replace the placeholder URL:
```markdown
## 🌐 Live Demo

- **API Base URL**: `https://your-actual-url.railway.app`
- **Health Check**: `https://your-actual-url.railway.app/api/health`
```

### 2. COMPLETION_REPORT.md
Add your deployment URL in the "Deployment" section.

### 3. Update Postman Collection
Set the `base_url` variable to your Railway URL.

---

## 🎥 Record Demo Video

Now that your app is deployed:

1. Follow instructions in `VIDEO_GUIDE.md`
2. Show:
   - Live API calls to your Railway URL
   - WebSocket updates in browser
   - Response times and caching
   - Brief architecture explanation
3. Upload to YouTube
4. Add link to README.md

---

## 🐛 Troubleshooting

### Build Fails
**Check:**
- Build logs in Railway dashboard
- `package.json` scripts are correct
- TypeScript compiles locally: `npm run build`

**Fix:**
```powershell
# Test locally first
npm install
npm run build
npm start
```

### App Crashes on Start
**Check:**
- Runtime logs in Railway
- Environment variables are set
- Redis service is running

**Common Issues:**
- Missing `REDIS_URL` → Add Redis service
- Port binding → Railway sets PORT automatically
- Node version → Check `engines` in package.json

### Redis Connection Error
**Verify:**
```powershell
# Via CLI
railway variables | Select-String "REDIS"
```

**Fix:**
- Ensure Redis service is added to project
- Check Redis service is running in Railway dashboard

### Can't Access Deployment
**Check:**
- Domain is generated in Settings → Networking
- Deployment status is "Success"
- Health endpoint responds

**Test:**
```powershell
curl https://your-url.railway.app/api/health
```

---

## 💰 Railway Pricing

**Free Tier:**
- $5 credit per month
- Enough for:
  - Web service (Node.js app)
  - Redis database
  - ~500 hours uptime
- Perfect for this project!

**If You Exceed:**
- Add payment method
- Pay only for what you use
- Approximately $5-10/month for this app

---

## 🎯 Next Steps After Deployment

1. ✅ **Test all endpoints** with Postman
2. ✅ **Verify WebSocket** connection
3. ✅ **Update README.md** with live URL
4. ✅ **Record demo video** (1-2 minutes)
5. ✅ **Upload video** to YouTube
6. ✅ **Update documentation** with video link
7. ✅ **Submit project** with all deliverables

---

## 📋 Submission Checklist

After deployment, you'll have:

- [x] ✅ GitHub Repository: `https://github.com/Mohitsagar236/ETRENA--BACKEND`
- [ ] ⚠️ **Live Deployment**: `https://your-app.railway.app` (Add after deployment)
- [ ] ⚠️ **Demo Video**: YouTube link (Record and add)
- [x] ✅ Postman Collection: `postman_collection.json`
- [x] ✅ 20+ Tests: All passing

---

## 🚀 Ready to Deploy!

Choose your deployment method:

1. **Dashboard (Easiest)**: Follow "Option A" above
2. **Automated**: Run `.\deploy-railway.ps1`
3. **CLI**: Follow "Option C" above

**Estimated Time:** 5-10 minutes

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **This Project**: See `RAILWAY_DEPLOY.md` for detailed guide

---

**Good luck with your deployment! 🎉**
