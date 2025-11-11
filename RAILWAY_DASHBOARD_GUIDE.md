# 🚂 RAILWAY DASHBOARD DEPLOYMENT - STEP-BY-STEP

✅ **Your code is now on GitHub!**

Repository: https://github.com/Mohitsagar236/ETRENA--BACKEND

---

## 📋 Quick Deployment Checklist

Follow these steps to deploy on Railway Dashboard (no CLI needed):

---

### STEP 1: Access Railway 🌐

**Action:**
1. Open your browser
2. Go to: **https://railway.app**
3. Click **"Login"** or **"Start a New Project"**
4. Choose **"Sign in with GitHub"**
5. Authorize Railway to access your GitHub account

✅ **You should now be on the Railway Dashboard**

---

### STEP 2: Create New Project 📦

**Action:**
1. On Railway Dashboard, click **"New Project"** (top right, or center button)
2. Select **"Deploy from GitHub repo"**
3. If prompted, grant Railway access to your repositories
4. Search for and select: **`ETRENA--BACKEND`** or **`Mohitsagar236/ETRENA--BACKEND`**

✅ **Railway will automatically detect your Node.js project**

**What happens next:**
- Railway reads `railway.json` configuration
- Railway reads `package.json` for dependencies
- Railway starts building your project automatically
- You'll see build logs in the "Deployments" tab

⏱️ **Build time: ~2-3 minutes**

---

### STEP 3: Add Redis Database 🗄️

**Why:** Your app needs Redis for caching

**Action:**
1. In your Railway project view, click **"+ New"** button
2. Select **"Database"**
3. Choose **"Add Redis"**
4. Railway will create a Redis instance automatically

✅ **Redis is now connected!**

**What happens:**
- Railway automatically creates a Redis service
- Sets the `REDIS_URL` environment variable
- Connects it to your web service
- Your app can now use caching!

---

### STEP 4: Configure Environment Variables (Optional Check) ⚙️

**Action:**
1. Click on your **web service** (usually named "ETRENA--BACKEND")
2. Go to the **"Variables"** tab
3. Verify these variables are set:

**Required Variables:**
```
NODE_ENV=production
PORT=3000 (or let Railway set it automatically)
CACHE_TTL=30
LOG_LEVEL=info
WS_UPDATE_INTERVAL=5000
DEXSCREENER_RATE_LIMIT=300
JUPITER_RATE_LIMIT=600
GECKOTERMINAL_RATE_LIMIT=300
```

**Automatically Set by Railway:**
```
REDIS_URL (set when you added Redis)
PORT (Railway manages this)
```

**If any are missing, add them:**
1. Click **"+ New Variable"**
2. Enter **Variable Name** and **Value**
3. Click **"Add"**

✅ **Environment configured!**

---

### STEP 5: Wait for Deployment ⏳

**Action:**
1. Click on the **"Deployments"** tab
2. Watch the build progress
3. Wait for **"Success"** status

**Build stages:**
1. ⏳ Installing dependencies (`npm install`)
2. ⏳ Building TypeScript (`npm run build`)
3. ⏳ Starting server (`npm start`)
4. ✅ **Deployment successful!**

⏱️ **Total time: ~3-5 minutes**

**If build fails:**
- Check the logs in the Deployments tab
- See DEPLOY_NOW.md troubleshooting section
- Common fix: Ensure all files are pushed to GitHub

---

### STEP 6: Generate Public Domain 🌐

**Action:**
1. Click on your **web service** (ETRENA--BACKEND)
2. Go to **"Settings"** tab
3. Scroll down to **"Networking"** section
4. Click **"Generate Domain"** button

✅ **Your public URL is ready!**

**You'll get a URL like:**
```
https://etrena-backend-production.up.railway.app
```

**Copy this URL** - you'll need it for testing and updating your README!

---

### STEP 7: Test Your Deployment 🧪

**Action:**
1. Copy your Railway URL from Step 6
2. Open PowerShell or your browser
3. Test the endpoints:

**Test 1: Health Check**
```powershell
# Replace with your actual Railway URL
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

**Test 2: Get Tokens**
```powershell
curl "https://your-app.railway.app/api/tokens?limit=5&sortBy=volume"
```

**Test 3: Get Metrics**
```powershell
curl https://your-app.railway.app/api/metrics
```

**Test 4: Open in Browser**
```
https://your-app.railway.app
```

You should see the API welcome message.

✅ **Your API is live!**

---

### STEP 8: Monitor Your Deployment 📊

**Available Tools:**

**1. View Logs:**
- Click your service → **"Logs"** tab
- See real-time application logs
- Monitor API requests and errors

**2. Check Metrics:**
- Click your service → **"Metrics"** tab
- View CPU, Memory, Network usage
- Monitor performance

**3. Check Deployments:**
- **"Deployments"** tab shows history
- See build times and status
- Rollback if needed

---

### STEP 9: Update Your Documentation 📝

**Action:**

1. **Update README.md** with your Railway URL:

Open `README.md` and replace:
```markdown
- **API Base URL**: `https://your-app.railway.app`
```

With your actual URL:
```markdown
- **API Base URL**: `https://etrena-backend-production.up.railway.app`
```

2. **Commit and push:**
```powershell
git add README.md
git commit -m "docs: Update README with Railway deployment URL"
git push origin master
```

3. **Update Postman Collection:**
- Open Postman
- Import `postman_collection.json`
- Set `base_url` variable to your Railway URL
- Test all endpoints

---

### STEP 10: Test WebSocket Connection 🔌

**Action:**

1. Open `websocket-demo.html` in a text editor
2. Find this line (around line 15):
```javascript
const socket = io('http://localhost:3000');
```

3. Replace with your Railway URL:
```javascript
const socket = io('https://your-app.railway.app');
```

4. Save and open in browser
5. You should see:
   - ✅ "Connected to WebSocket server"
   - ✅ Token data loading
   - ✅ Real-time updates

---

## 🎉 DEPLOYMENT COMPLETE!

Your app is now live on Railway! 🚀

### What You've Accomplished:

✅ Deployed Node.js + TypeScript app
✅ Connected Redis database
✅ Generated public domain
✅ Tested API endpoints
✅ WebSocket working
✅ Monitoring enabled

---

## 📋 Next Steps:

### 1. Record Demo Video 🎥

Follow the instructions in `VIDEO_GUIDE.md`:
- Show your live Railway API
- Demonstrate WebSocket updates
- Show response times and caching
- Explain architecture briefly

**Video Requirements:**
- 1-2 minutes
- Show live deployment
- Upload to YouTube

### 2. Complete Submission ✅

You now have:
- ✅ GitHub Repository: https://github.com/Mohitsagar236/ETRENA--BACKEND
- ✅ Live Deployment: [Your Railway URL]
- ⚠️ Demo Video: [Record and upload to YouTube]
- ✅ Postman Collection: In repository
- ✅ 20+ Tests: All passing

### 3. Update All Documentation

Update these files with your Railway URL:
- README.md (Live Demo section)
- COMPLETION_REPORT.md
- Postman collection base_url

---

## 🐛 Troubleshooting

### Build Failed
**Check:**
- Railway Deployments tab for error logs
- Ensure `package.json` scripts are correct
- Verify all files are pushed to GitHub

**Fix:**
```powershell
# Test build locally
npm run build

# If successful, push and redeploy
git push origin master
```

### App Crashes
**Check:**
- Logs tab for error messages
- Verify Redis service is running
- Check environment variables

### Can't Access URL
**Check:**
- Domain is generated in Settings → Networking
- Deployment status is "Success"
- Try opening in incognito mode

### Redis Connection Error
**Fix:**
- Ensure Redis service is added
- Check REDIS_URL in Variables tab
- Restart deployment

---

## 💰 Cost Information

**Railway Free Tier:**
- $5 free credit per month
- Includes everything you need
- Your app should use ~$3-4/month
- Well within free tier! ✅

---

## 📞 Support

**Railway Help:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

**Your Project:**
- See `DEPLOY_NOW.md` for detailed troubleshooting
- See `RAILWAY_DEPLOY.md` for comprehensive guide

---

## ✨ Summary

**Deployment Time:** ~10 minutes
**Status:** ✅ LIVE
**URL:** [Your Railway URL]
**Monitoring:** ✅ Enabled
**Auto-Deploy:** ✅ Enabled (pushes to GitHub auto-deploy)

**Congratulations! Your app is live! 🎉**

Now record your demo video and submit your project! 🚀

---

**Quick Links:**
- Railway Dashboard: https://railway.app
- Your GitHub: https://github.com/Mohitsagar236/ETRENA--BACKEND
- Your Railway App: [Insert your URL after Step 6]
