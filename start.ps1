# Prepend local Node path
$env:Path = 'c:\Users\bhuva\OneDrive\desktop\Food saga\.tools\node-v20.15.0-win-x64;' + $env:Path

Write-Host "Starting Food Saga Backend..." -ForegroundColor Green
# Start Backend
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "c:\Users\bhuva\OneDrive\desktop\Food saga\server"

Write-Host "Starting Food Saga Frontend..." -ForegroundColor Green
# Start Frontend Dev Server
Set-Location "c:\Users\bhuva\OneDrive\desktop\Food saga\client"
npm run dev
