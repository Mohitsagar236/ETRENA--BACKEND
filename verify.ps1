# Installation & Verification Script

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Meme Coin Aggregator - Installation Verification         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Function to check status
function Check-Status {
    param($name, $condition, $successMsg, $failMsg)
    
    Write-Host "Checking $name... " -NoNewline
    
    if ($condition) {
        Write-Host "✅ PASS" -ForegroundColor Green
        Write-Host "   $successMsg" -ForegroundColor Gray
        return $true
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
        Write-Host "   $failMsg" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "PREREQUISITE CHECKS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check Node.js
$nodeVersion = node --version 2>$null
$nodeCheck = Check-Status "Node.js" ($LASTEXITCODE -eq 0) `
    "Node.js $nodeVersion is installed" `
    "Node.js is not installed. Install from https://nodejs.org/"
$allPassed = $allPassed -and $nodeCheck

# Check npm
$npmVersion = npm --version 2>$null
$npmCheck = Check-Status "npm" ($LASTEXITCODE -eq 0) `
    "npm $npmVersion is available" `
    "npm is not available"
$allPassed = $allPassed -and $npmCheck

# Check Git
$gitVersion = git --version 2>$null
$gitCheck = Check-Status "Git" ($LASTEXITCODE -eq 0) `
    "Git is installed" `
    "Git is not installed (optional for deployment)"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "PROJECT FILES CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check critical files
$files = @(
    @{Name="package.json"; Required=$true},
    @{Name="tsconfig.json"; Required=$true},
    @{Name=".env.example"; Required=$true},
    @{Name="README.md"; Required=$true},
    @{Name="src/server.ts"; Required=$true},
    @{Name="src/config/index.ts"; Required=$true},
    @{Name="src/services/aggregation.service.ts"; Required=$true}
)

foreach ($file in $files) {
    $exists = Test-Path $file.Name
    $fileCheck = Check-Status $file.Name $exists `
        "File exists" `
        "File is missing!"
    if ($file.Required) {
        $allPassed = $allPassed -and $fileCheck
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "DEPENDENCIES CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check if node_modules exists
$nodeModulesExists = Test-Path "node_modules"
$depsCheck = Check-Status "Dependencies installed" $nodeModulesExists `
    "node_modules folder exists" `
    "Run 'npm install' to install dependencies"
$allPassed = $allPassed -and $depsCheck

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ENVIRONMENT CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check .env file
$envExists = Test-Path ".env"
$envCheck = Check-Status ".env file" $envExists `
    ".env file exists" `
    "Copy .env.example to .env: copy .env.example .env"
$allPassed = $allPassed -and $envCheck

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "REDIS CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check Redis
$redisRunning = $false
$redisPing = redis-cli ping 2>$null
if ($LASTEXITCODE -eq 0) {
    $redisRunning = $true
}

$redisCheck = Check-Status "Redis connection" $redisRunning `
    "Redis is running and accessible" `
    "Redis not running. Start with: docker run -d -p 6379:6379 redis:alpine"

if (-not $redisRunning) {
    Write-Host "   ℹ️  Note: Service will work without Redis (slower responses)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "BUILD CHECK" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check if dist exists
$distExists = Test-Path "dist"
if ($distExists) {
    Write-Host "Checking dist/ folder... ✅ PASS" -ForegroundColor Green
    Write-Host "   Project has been built" -ForegroundColor Gray
} else {
    Write-Host "Checking dist/ folder... ⚠️  WARNING" -ForegroundColor Yellow
    Write-Host "   Project not built yet. Run 'npm run build'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host ""
    Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You're ready to start! Run these commands:" -ForegroundColor White
    Write-Host ""
    Write-Host "   npm run dev         # Start development server" -ForegroundColor Cyan
    Write-Host "   npm test            # Run tests" -ForegroundColor Cyan
    Write-Host "   .\demo.ps1          # Run demo" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then open:" -ForegroundColor White
    Write-Host "   http://localhost:3000              # API" -ForegroundColor Gray
    Write-Host "   websocket-demo.html                # WebSocket Demo" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  SOME CHECKS FAILED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please fix the issues above before proceeding." -ForegroundColor White
    Write-Host ""
    Write-Host "Quick fixes:" -ForegroundColor White
    Write-Host "   npm install                        # Install dependencies" -ForegroundColor Gray
    Write-Host "   copy .env.example .env             # Create .env file" -ForegroundColor Gray
    Write-Host "   docker run -d -p 6379:6379 redis:alpine  # Start Redis" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed setup instructions, see:" -ForegroundColor White
Write-Host "   QUICKSTART.md" -ForegroundColor Cyan
Write-Host ""
