# Demo Script for Video Recording

Write-Host "🎥 Meme Coin Aggregator - Demo Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script demonstrates the key features of the API" -ForegroundColor White
Write-Host ""

$baseUrl = "http://localhost:3000"

function Test-Endpoint {
    param($url, $description)
    Write-Host "📡 $description" -ForegroundColor Yellow
    Write-Host "   URL: $url" -ForegroundColor Gray
    $start = Get-Date
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
        $duration = ((Get-Date) - $start).TotalMilliseconds
        Write-Host "   ✅ Success! Response time: $([math]::Round($duration))ms" -ForegroundColor Green
        return $duration
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        return -1
    }
    Write-Host ""
}

Write-Host "Starting demo in 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host ""

# Test 1: Health Check
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 1: Health Check" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Test-Endpoint "$baseUrl/api/health" "Checking system health"
Start-Sleep -Seconds 1

# Test 2: Get All Tokens
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 2: Fetch Tokens (Uncached)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$time1 = Test-Endpoint "$baseUrl/api/tokens?limit=20" "First request (uncached)"
Start-Sleep -Seconds 1

# Test 3: Get All Tokens (Cached)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 3: Fetch Tokens (Cached)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$time2 = Test-Endpoint "$baseUrl/api/tokens?limit=20" "Second request (cached)"
if ($time1 -gt 0 -and $time2 -gt 0) {
    $speedup = [math]::Round($time1 / $time2, 2)
    Write-Host "   🚀 Cache speedup: ${speedup}x faster!" -ForegroundColor Green
}
Start-Sleep -Seconds 1

# Test 4: Rapid Fire Requests
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 4: Rapid Fire (10 Requests)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$times = @()
for ($i = 1; $i -le 10; $i++) {
    Write-Host "   Request $i/10..." -NoNewline
    $start = Get-Date
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/tokens?limit=10" -Method Get -TimeoutSec 5 | Out-Null
        $duration = ((Get-Date) - $start).TotalMilliseconds
        $times += $duration
        Write-Host " $([math]::Round($duration))ms ✅" -ForegroundColor Green
    } catch {
        Write-Host " Failed ❌" -ForegroundColor Red
    }
}
if ($times.Count -gt 0) {
    $avgTime = [math]::Round(($times | Measure-Object -Average).Average, 2)
    $minTime = [math]::Round(($times | Measure-Object -Minimum).Minimum, 2)
    $maxTime = [math]::Round(($times | Measure-Object -Maximum).Maximum, 2)
    Write-Host ""
    Write-Host "   📊 Statistics:" -ForegroundColor Yellow
    Write-Host "      Average: ${avgTime}ms" -ForegroundColor White
    Write-Host "      Min: ${minTime}ms" -ForegroundColor White
    Write-Host "      Max: ${maxTime}ms" -ForegroundColor White
}
Start-Sleep -Seconds 1

# Test 5: Filtering
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 5: Filtering & Sorting" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Test-Endpoint "$baseUrl/api/tokens?sortBy=volume&sortOrder=desc&limit=5" "Sort by volume (desc)"
Test-Endpoint "$baseUrl/api/tokens?sortBy=price_change&timePeriod=1h&limit=5" "Top gainers (1h)"
Test-Endpoint "$baseUrl/api/tokens?minVolume=100&minMarketCap=500" "Filter by volume & market cap"
Start-Sleep -Seconds 1

# Test 6: Pagination
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 6: Pagination" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Test-Endpoint "$baseUrl/api/tokens?limit=5" "Page 1 (limit=5)"
Test-Endpoint "$baseUrl/api/tokens?limit=5&cursor=5" "Page 2 (cursor=5)"
Start-Sleep -Seconds 1

# Test 7: Metrics
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 7: Metrics" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Test-Endpoint "$baseUrl/api/metrics" "Get aggregated metrics"
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Demo Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Open websocket-demo.html to see real-time updates!" -ForegroundColor Yellow
Write-Host ""
