# Quick Start Script for Demo

Write-Host "🚀 Meme Coin Aggregator - Quick Start" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
Write-Host ""

# Check if Redis is available
Write-Host "Checking Redis..." -ForegroundColor Yellow
$redisCheck = redis-cli ping 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Redis is not running locally" -ForegroundColor Yellow
    Write-Host "Starting Redis with Docker..." -ForegroundColor Yellow
    docker run -d -p 6379:6379 --name meme-coin-redis redis:alpine 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Redis started in Docker" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "⚠️  Docker not available. Service will run without cache." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Redis is running" -ForegroundColor Green
}
Write-Host ""

# Create .env if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build the project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Project built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Open websocket-demo.html to see live updates" -ForegroundColor White
Write-Host "4. Import postman_collection.json into Postman to test API" -ForegroundColor White
Write-Host ""
Write-Host "For production deployment:" -ForegroundColor Yellow
Write-Host "- Run 'npm start' to start production server" -ForegroundColor White
Write-Host "- See README.md for deployment instructions" -ForegroundColor White
Write-Host ""
