Write-Host "Building frontend..." -ForegroundColor Cyan
cd Service-graph-dashboard
npm run build

Write-Host "Copying build files to backend/public..." -ForegroundColor Cyan
cd ..
if (Test-Path "backend\public") {
    Remove-Item -Recurse -Force "backend\public\*"
}
New-Item -ItemType Directory -Path "backend\public" -Force | Out-Null
Copy-Item -Path "Service-graph-dashboard\dist\*" -Destination "backend\public" -Recurse -Force

Write-Host "Deploy complete!" -ForegroundColor Green
Write-Host "To start the server, run: cd backend && npm start" -ForegroundColor Yellow