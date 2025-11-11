# Railway Deployment Script for PowerShell
# Run this script to deploy your app to Railway

Write-Host "🚂 Railway Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if Railway CLI is installed
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Railway CLI is not installed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Would you like to:" -ForegroundColor Cyan
    Write-Host "1. Deploy via Railway Dashboard (Recommended - No CLI needed)"
    Write-Host "2. Install Railway CLI and deploy"
    Write-Host ""
    $choice = Read-Host "Enter your choice (1 or 2)"
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "📖 Opening deployment guide..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Follow these steps:" -ForegroundColor Cyan
        Write-Host "1. Push your code to GitHub (we'll help you with this)"
        Write-Host "2. Go to https://railway.app and sign in with GitHub"
        Write-Host "3. Click 'New Project' → 'Deploy from GitHub repo'"
        Write-Host "4. Select your repository: Mohitsagar236/ETRENA--BACKEND"
        Write-Host "5. Add Redis service: Click '+ New' → 'Database' → 'Redis'"
        Write-Host "6. Railway will auto-deploy!"
        Write-Host ""
        
        # Ask if they want to push to GitHub
        Write-Host "Would you like to push to GitHub now? (y/n)" -ForegroundColor Yellow
        $pushGit = Read-Host
        
        if ($pushGit -eq "y" -or $pushGit -eq "Y") {
            Write-Host ""
            Write-Host "📤 Preparing GitHub push..." -ForegroundColor Green
            
            # Check if git repo exists
            if (-not (Test-Path ".git")) {
                Write-Host "Initializing git repository..." -ForegroundColor Yellow
                git init
                git add .
                git commit -m "Initial commit: Ready for Railway deployment"
            } else {
                Write-Host "Committing latest changes..." -ForegroundColor Yellow
                git add .
                git commit -m "Update: Ready for Railway deployment"
            }
            
            # Check if remote exists
            $remoteUrl = git remote get-url origin 2>$null
            if (-not $remoteUrl) {
                Write-Host ""
                Write-Host "Enter your GitHub repository URL:" -ForegroundColor Cyan
                Write-Host "Example: https://github.com/Mohitsagar236/ETRENA--BACKEND.git"
                $repoUrl = Read-Host "URL"
                
                git remote add origin $repoUrl
            }
            
            Write-Host ""
            Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
            git branch -M main
            git push -u origin main
            
            Write-Host ""
            Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Go to https://railway.app" -ForegroundColor White
            Write-Host "2. Sign in with GitHub" -ForegroundColor White
            Write-Host "3. Click 'New Project' → 'Deploy from GitHub repo'" -ForegroundColor White
            Write-Host "4. Select your repository" -ForegroundColor White
            Write-Host "5. Add Redis: Click '+ New' → 'Database' → 'Redis'" -ForegroundColor White
            Write-Host "6. Wait for deployment to complete" -ForegroundColor White
            Write-Host "7. Click 'Settings' → 'Networking' → 'Generate Domain'" -ForegroundColor White
            Write-Host ""
            Write-Host "📖 For detailed guide, see RAILWAY_DEPLOY.md" -ForegroundColor Yellow
        }
        
        Start-Process "RAILWAY_DEPLOY.md"
        exit 0
    } else {
        Write-Host ""
        Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
        Write-Host "Please run PowerShell as Administrator and execute:" -ForegroundColor Cyan
        Write-Host "iwr https://railway.app/install.ps1 | iex" -ForegroundColor White
        Write-Host ""
        Write-Host "After installation, run this script again." -ForegroundColor Yellow
        exit 0
    }
}

# Railway CLI is installed
Write-Host "✅ Railway CLI is installed" -ForegroundColor Green
Write-Host ""

# Check if logged in to Railway
Write-Host "🔐 Checking Railway authentication..." -ForegroundColor Yellow
$authCheck = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Railway. Logging in..." -ForegroundColor Yellow
    railway login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed. Please try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Logged in to Railway" -ForegroundColor Green
Write-Host ""

# Check if project is linked
Write-Host "🔗 Checking project link..." -ForegroundColor Yellow
$projectCheck = railway status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "No Railway project linked. Creating new project..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Enter a name for your Railway project:" -ForegroundColor Cyan
    $projectName = Read-Host "Project name (default: meme-coin-aggregator)"
    
    if ([string]::IsNullOrWhiteSpace($projectName)) {
        $projectName = "meme-coin-aggregator"
    }
    
    railway init --name $projectName
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create project. Please try manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Project linked" -ForegroundColor Green
Write-Host ""

# Add Redis if not already added
Write-Host "🗄️  Adding Redis service..." -ForegroundColor Yellow
railway add redis 2>&1 | Out-Null
Write-Host "✅ Redis configured" -ForegroundColor Green
Write-Host ""

# Set environment variables
Write-Host "⚙️  Setting environment variables..." -ForegroundColor Yellow
railway variables set NODE_ENV=production 2>&1 | Out-Null
railway variables set CACHE_TTL=30 2>&1 | Out-Null
railway variables set LOG_LEVEL=info 2>&1 | Out-Null
railway variables set WS_UPDATE_INTERVAL=5000 2>&1 | Out-Null
railway variables set DEXSCREENER_RATE_LIMIT=300 2>&1 | Out-Null
railway variables set JUPITER_RATE_LIMIT=600 2>&1 | Out-Null
railway variables set GECKOTERMINAL_RATE_LIMIT=300 2>&1 | Out-Null
Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host ""

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes..." -ForegroundColor Cyan
railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed. Check logs above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""

# Generate domain if not exists
Write-Host "🌐 Generating public domain..." -ForegroundColor Yellow
$domain = railway domain 2>&1
if ($domain -like "*No domain*" -or $domain -like "*not found*") {
    railway domain generate
    Start-Sleep -Seconds 2
    $domain = railway domain
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app is live at:" -ForegroundColor Yellow
railway domain
Write-Host ""

# Get the domain URL
$deployUrl = railway domain
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test your API:" -ForegroundColor White
Write-Host "   curl $deployUrl/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "2. View logs:" -ForegroundColor White
Write-Host "   railway logs" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open in browser:" -ForegroundColor White
Write-Host "   railway open" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Update README.md with your deployment URL" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full documentation: RAILWAY_DEPLOY.md" -ForegroundColor Yellow
Write-Host ""

# Ask if they want to open in browser
Write-Host "Would you like to open your deployed app now? (y/n)" -ForegroundColor Cyan
$openBrowser = Read-Host

if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    railway open
}

Write-Host ""
Write-Host "✨ Deployment complete! Happy coding! 🚀" -ForegroundColor Green
