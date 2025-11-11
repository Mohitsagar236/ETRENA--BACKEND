# Quick Vercel Deployment Script
# Run this after setting up Vercel account

Write-Host "`n🚀 Vercel Deployment Helper`n" -ForegroundColor Cyan

Write-Host "📋 Prerequisites Check:" -ForegroundColor Yellow
Write-Host "  ✅ Code pushed to GitHub" -ForegroundColor Green
Write-Host "  ⚠️  Vercel account created? (go to vercel.com)" -ForegroundColor Yellow
Write-Host "  ⚠️  Upstash account created? (go to upstash.com)`n" -ForegroundColor Yellow

Write-Host "📦 Creating Vercel configuration..." -ForegroundColor Yellow

# Ensure vercel.json exists
if (Test-Path "vercel.json") {
    Write-Host "  ✅ vercel.json found" -ForegroundColor Green
} else {
    Write-Host "  ❌ vercel.json missing - creating it..." -ForegroundColor Red
    @"
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
"@ | Out-File -FilePath "vercel.json" -Encoding UTF8
    Write-Host "  ✅ vercel.json created" -ForegroundColor Green
}

Write-Host "`n🔨 Testing build locally..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Build failed - fix errors before deploying" -ForegroundColor Red
    exit 1
}

Write-Host "`n📤 Committing Vercel config..." -ForegroundColor Yellow
git add vercel.json
git commit -m "feat: Add Vercel deployment configuration"
git push origin master

Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 78) -ForegroundColor Cyan
Write-Host "🎯 DEPLOY TO VERCEL NOW" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Cyan

Write-Host "`nSTEP 1: Deploy to Vercel" -ForegroundColor Yellow
Write-Host "  1. Go to: " -NoNewline; Write-Host "https://vercel.com" -ForegroundColor Cyan
Write-Host "  2. Sign in with GitHub" -ForegroundColor White
Write-Host "  3. Click 'Add New' → 'Project'" -ForegroundColor White
Write-Host "  4. Import: ETRENA--BACKEND" -ForegroundColor White
Write-Host "  5. Click 'Deploy' (use default settings)" -ForegroundColor White

Write-Host "`nSTEP 2: Setup Free Redis (Upstash)" -ForegroundColor Yellow
Write-Host "  1. Go to: " -NoNewline; Write-Host "https://upstash.com" -ForegroundColor Cyan
Write-Host "  2. Sign in with GitHub" -ForegroundColor White
Write-Host "  3. Create Database → Name: meme-coin-cache" -ForegroundColor White
Write-Host "  4. Copy REDIS_URL" -ForegroundColor White

Write-Host "`nSTEP 3: Add Environment Variables to Vercel" -ForegroundColor Yellow
Write-Host "  1. In Vercel → Your Project → Settings → Environment Variables" -ForegroundColor White
Write-Host "  2. Add these variables:" -ForegroundColor White
Write-Host "     REDIS_URL = [Your Upstash URL]" -ForegroundColor Gray
Write-Host "     NODE_ENV = production" -ForegroundColor Gray
Write-Host "     CACHE_TTL = 30" -ForegroundColor Gray
Write-Host "     LOG_LEVEL = info" -ForegroundColor Gray
Write-Host "     WS_UPDATE_INTERVAL = 5000" -ForegroundColor Gray
Write-Host "  3. Redeploy from Deployments tab" -ForegroundColor White

Write-Host "`nSTEP 4: Test Your Deployment" -ForegroundColor Yellow
Write-Host "  curl https://your-app.vercel.app/api/health" -ForegroundColor Gray

Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 78) -ForegroundColor Cyan
Write-Host "📖 Full Guide: VERCEL_DEPLOY.md" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan

Write-Host "`nOpening Vercel in browser...`n" -ForegroundColor Yellow

Start-Process "https://vercel.com"
Start-Sleep -Seconds 2
Start-Process "https://upstash.com"

Write-Host "✨ Setup complete! Follow the steps above to deploy.`n" -ForegroundColor Green
