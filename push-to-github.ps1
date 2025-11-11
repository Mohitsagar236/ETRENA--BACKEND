# Quick Push to GitHub Script
# Run this to commit and push Railway deployment files

Write-Host "`n🚀 Preparing for Railway Deployment`n" -ForegroundColor Cyan

# Check git status
Write-Host "📋 Checking git status..." -ForegroundColor Yellow
git status --short

Write-Host "`n📦 Adding Railway deployment files..." -ForegroundColor Yellow
git add .

Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
git commit -m "feat: Add Railway deployment configuration

- Add railway.json for Railway auto-deploy
- Add deployment scripts and guides
- Update README with Railway deployment section
- Add completion report and deployment documentation"

Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed to GitHub!`n" -ForegroundColor Green
    Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to https://railway.app" -ForegroundColor White
    Write-Host "  2. Sign in with GitHub (Mohitsagar236)" -ForegroundColor White
    Write-Host "  3. Click 'New Project' → 'Deploy from GitHub repo'" -ForegroundColor White
    Write-Host "  4. Select: ETRENA--BACKEND" -ForegroundColor White
    Write-Host "  5. Click '+ New' → 'Database' → 'Add Redis'" -ForegroundColor White
    Write-Host "  6. Go to 'Settings' → 'Networking' → 'Generate Domain'" -ForegroundColor White
    Write-Host "  7. Test your deployment!" -ForegroundColor White
    Write-Host "`n📖 See DEPLOY_NOW.md for detailed guide`n" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Push failed. Please check the error above.`n" -ForegroundColor Red
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  • Make sure you're connected to the internet" -ForegroundColor White
    Write-Host "  • Verify remote URL: git remote -v" -ForegroundColor White
    Write-Host "  • Try: git pull origin master --rebase" -ForegroundColor White
}
