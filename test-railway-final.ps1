# ===================================================================
# TEST FINAL DE RAILWAY BACKEND
# ===================================================================

Write-Host "=== TESTING RAILWAY BACKEND ===" -ForegroundColor Green
Write-Host ""

$railwayUrl = "https://iracing-setup-assistant-production.up.railway.app"
Write-Host "Testing Railway URL: $railwayUrl" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$railwayUrl/health" -Method GET -TimeoutSec 15
    Write-Host "   SUCCESS: Health check passed" -ForegroundColor Green
    Write-Host "   Response: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor White
} catch {
    Write-Host "   ERROR: Health check failed" -ForegroundColor Red
    Write-Host "   Details: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Cars API
Write-Host "2. Testing Cars API..." -ForegroundColor Yellow
try {
    $carsResponse = Invoke-RestMethod -Uri "$railwayUrl/api/cars" -Method GET -TimeoutSec 15
    Write-Host "   SUCCESS: Cars API working" -ForegroundColor Green
    Write-Host "   Found $($carsResponse.Count) cars" -ForegroundColor White
    if ($carsResponse.Count -gt 0) {
        Write-Host "   First car: $($carsResponse[0].name)" -ForegroundColor White
    }
} catch {
    Write-Host "   ERROR: Cars API failed" -ForegroundColor Red
    Write-Host "   Details: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Tracks API
Write-Host "3. Testing Tracks API..." -ForegroundColor Yellow
try {
    $tracksResponse = Invoke-RestMethod -Uri "$railwayUrl/api/tracks" -Method GET -TimeoutSec 15
    Write-Host "   SUCCESS: Tracks API working" -ForegroundColor Green
    Write-Host "   Found $($tracksResponse.Count) tracks" -ForegroundColor White
    if ($tracksResponse.Count -gt 0) {
        Write-Host "   First track: $($tracksResponse[0].name)" -ForegroundColor White
    }
} catch {
    Write-Host "   ERROR: Tracks API failed" -ForegroundColor Red
    Write-Host "   Details: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== NEXT STEPS ===" -ForegroundColor Magenta
Write-Host ""
Write-Host "If all tests PASSED:" -ForegroundColor Green
Write-Host "1. Go to Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Find your project: i-racing-setup-assistant" -ForegroundColor White
Write-Host "3. Go to Settings > Environment Variables" -ForegroundColor White
Write-Host "4. Add/Edit REACT_APP_API_URL = $railwayUrl" -ForegroundColor Yellow
Write-Host "5. Redeploy your application" -ForegroundColor White
Write-Host ""
Write-Host "If tests FAILED:" -ForegroundColor Red
Write-Host "1. Check Railway Dashboard: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Verify your backend is deployed and running" -ForegroundColor White
Write-Host "3. Check Railway logs for errors" -ForegroundColor White
Write-Host "4. Ensure database is connected" -ForegroundColor White
Write-Host ""

Write-Host "=== VERCEL CONFIGURATION STEPS ===" -ForegroundColor Cyan
Write-Host "1. Open: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Click on your project" -ForegroundColor White
Write-Host "3. Go to Settings tab" -ForegroundColor White
Write-Host "4. Click Environment Variables" -ForegroundColor White
Write-Host "5. Add new variable:" -ForegroundColor White
Write-Host "   - Name: REACT_APP_API_URL" -ForegroundColor Yellow
Write-Host "   - Value: $railwayUrl" -ForegroundColor Yellow
Write-Host "   - Environments: Production, Preview, Development" -ForegroundColor Yellow
Write-Host "6. Save and redeploy" -ForegroundColor White
Write-Host ""

Write-Host "=== VERIFICATION ===" -ForegroundColor Magenta
Write-Host "After redeployment, check:" -ForegroundColor White
Write-Host "- Open your Vercel app" -ForegroundColor White
Write-Host "- Open Developer Tools (F12)" -ForegroundColor White
Write-Host "- Check Network tab for successful API calls" -ForegroundColor White
Write-Host "- Dropdowns should now be populated" -ForegroundColor White