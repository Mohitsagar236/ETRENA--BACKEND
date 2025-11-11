# 🚀 Vercel Deployment Guide (EASIEST FREE OPTION)

**No credit card needed | Deploy in 10 minutes**

---

## ✅ Why Vercel?

- ✅ **Completely FREE** - No credit card required
- ✅ **Super Easy** - Just click and deploy
- ✅ **Fast** - Deployed in 2-3 minutes
- ✅ **Reliable** - Used by millions
- ✅ **Auto-deploy** - Pushes to GitHub auto-deploy
- ✅ **Great for Node.js** - Perfect for your project

---

## 📋 What You'll Need:

1. GitHub account (you have this ✅)
2. Vercel account (free - we'll create)
3. Upstash account (free Redis - we'll create)

**Total time:** ~10 minutes

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### PART 1: Deploy to Vercel (5 minutes)

#### Step 1: Create Vercel Account

1. **Go to:** https://vercel.com
2. **Click:** "Sign Up"
3. **Choose:** "Continue with GitHub"
4. **Authorize:** Vercel to access your GitHub
5. **You're in!** ✅

#### Step 2: Import Your Project

1. **On Vercel Dashboard**, click **"Add New..."** → **"Project"**
2. **Import Git Repository** section
3. **Search for:** `ETRENA--BACKEND`
4. **Click:** "Import" next to your repository

#### Step 3: Configure Project

Vercel will show configuration screen:

**Framework Preset:** Other
**Root Directory:** ./
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

**Leave defaults and click "Deploy"**

⏱️ **Wait 2-3 minutes for deployment...**

#### Step 4: Get Your URL

After deployment succeeds:
- Vercel gives you a URL like: `https://etrena-backend.vercel.app`
- **Copy this URL** - you'll need it!

✅ **Your app is deployed! (But Redis not connected yet)**

---

### PART 2: Add Free Redis with Upstash (5 minutes)

#### Step 1: Create Upstash Account

1. **Go to:** https://upstash.com
2. **Click:** "Sign Up"
3. **Choose:** "Continue with GitHub"
4. **You're in!** ✅

#### Step 2: Create Redis Database

1. **Click:** "Create Database"
2. **Name:** `meme-coin-cache`
3. **Type:** Choose "Regional"
4. **Region:** Choose closest to you (e.g., US-East)
5. **Click:** "Create"

⏱️ **Takes ~30 seconds**

#### Step 3: Get Redis URL

1. **In Upstash dashboard**, click on your database
2. **Scroll to:** "REST API" section
3. **Copy:** The `UPSTASH_REDIS_REST_URL`
4. **Also copy:** The `UPSTASH_REDIS_REST_TOKEN`

**Or use the connection string format:**
```
redis://:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:PORT
```

#### Step 4: Add Redis URL to Vercel

1. **Go back to Vercel**
2. **Click on your project**
3. **Go to:** "Settings" tab
4. **Click:** "Environment Variables"
5. **Add these variables:**

```
REDIS_URL = [Your Upstash Redis URL]
NODE_ENV = production
CACHE_TTL = 30
LOG_LEVEL = info
WS_UPDATE_INTERVAL = 5000
DEXSCREENER_RATE_LIMIT = 300
JUPITER_RATE_LIMIT = 600
GECKOTERMINAL_RATE_LIMIT = 300
PORT = 3000
```

6. **Click "Save"**

#### Step 5: Redeploy

1. **Go to:** "Deployments" tab
2. **Click:** the three dots (...) on latest deployment
3. **Click:** "Redeploy"
4. **Wait ~2 minutes**

✅ **Your app is now live with Redis!**

---

## 🧪 Test Your Deployment

```powershell
# Replace with your Vercel URL
$url = "https://etrena-backend.vercel.app"

# Test health
curl "$url/api/health"

# Test tokens
curl "$url/api/tokens?limit=5"

# Test metrics
curl "$url/api/metrics"
```

**Expected:** All endpoints should work!

---

## 🔧 Update Your Code for Vercel

We need to make a small change to handle Vercel's serverless environment.

### Create Vercel Entry Point

Create `api/index.js`:
```javascript
// This file exports your Express app for Vercel
const app = require('../dist/server').default;
module.exports = app;
```

Or update your server.ts to export the app.

---

## 📝 Update README

Add to your README.md:

```markdown
## 🌐 Live Demo

- **API Base URL**: `https://etrena-backend.vercel.app`
- **Health Check**: `https://etrena-backend.vercel.app/api/health`
- **Deployed on**: Vercel + Upstash Redis
```

---

## 🐛 Troubleshooting

### Build Fails

**Check Vercel build logs:**
1. Go to "Deployments" tab
2. Click on failed deployment
3. Check "Building" section for errors

**Common fix:**
```powershell
# Test build locally
npm run build

# If works, commit and push
git add .
git commit -m "fix: Update for Vercel deployment"
git push origin master
```

### Redis Connection Error

**Check:**
- REDIS_URL is correctly set in Vercel environment variables
- Upstash database is active
- URL format is correct

**Fix:**
- Regenerate Upstash credentials
- Update REDIS_URL in Vercel
- Redeploy

### 404 Errors

**Check vercel.json routes:**
- Ensure all routes point to `dist/server.js`
- Verify build output is in `dist/` folder

---

## 💰 Costs

**Vercel Free Tier:**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Custom domains
- ✅ HTTPS included
- ✅ **More than enough for this project!**

**Upstash Free Tier:**
- ✅ 10,000 commands/day
- ✅ 256 MB storage
- ✅ **Perfect for caching!**

**Total: $0/month** 🎉

---

## 🎯 Next Steps After Deployment

1. ✅ **Test all endpoints** with Postman
2. ✅ **Update README.md** with Vercel URL
3. ✅ **Test WebSocket** (may need adjustment for Vercel)
4. ✅ **Record demo video**
5. ✅ **Submit project**

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Upstash Docs:** https://docs.upstash.com
- **Vercel Discord:** https://vercel.com/discord

---

## ⚡ Alternative: Quick Deploy Button

You can also use Vercel's deploy button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mohitsagar236/ETRENA--BACKEND)

---

**Your app will be live in ~10 minutes! 🚀**

Start here: https://vercel.com
