$env:Path = $env:Path + ";C:\Program Files\nodejs"
Write-Host "Updating local session PATH..." -ForegroundColor Green

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "npm found!" -ForegroundColor Green
    npm install
    npm run dev
} else {
    Write-Host "Error: npm still not found even after PATH update." -ForegroundColor Red
    Write-Host "Please check if C:\Program Files\nodejs actually exists." -ForegroundColor Yellow
}
