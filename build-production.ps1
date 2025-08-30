# Campus Events Frontend Production Build Script
Write-Host "Building Campus Events Frontend for Production..." -ForegroundColor Green
Write-Host ""

# Clean previous build
if (Test-Path "build") {
    Write-Host "Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "build"
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Set production environment variables
Write-Host "Setting production environment..." -ForegroundColor Yellow
$env:REACT_APP_API_URL = "https://campus-event-backend.onrender.com"
$env:REACT_APP_SOCKET_URL = "https://campus-event-backend.onrender.com"
$env:GENERATE_SOURCEMAP = "false"
$env:CI = "false"

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "Check the 'build' folder for production files." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
