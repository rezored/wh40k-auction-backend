@echo off
REM WH40K Auction System - Sold Auctions Deployment Script (Windows)
REM This script deploys the new excludeSold functionality

echo 🚀 Starting Sold Auctions deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Build NestJS backend
echo [INFO] Building NestJS backend...
npm run build

REM Check if NestJS build was successful
if not exist "dist\main.js" (
    echo [ERROR] NestJS build failed. main.js not found in dist directory.
    exit /b 1
)

echo [INFO] NestJS build completed successfully!

REM Run database migration for sold auctions
echo [INFO] Running database migration for sold auctions...
echo [WARNING] Please run the migration manually:
echo [WARNING] psql -U your_user -d your_database -f scripts/migration-sold-auctions.sql

REM Restart PM2 process
echo [INFO] Restarting PM2 process...
pm2 reload ecosystem.config.js --env production

REM Check if PM2 restart was successful
pm2 list | findstr "wh40k-auction-backend" >nul
if errorlevel 1 (
    echo [ERROR] PM2 process restart failed!
    exit /b 1
) else (
    echo [INFO] PM2 process restarted successfully!
)

echo 🎉 Sold Auctions deployment completed successfully!
echo 🔍 New excludeSold parameter is now available in auction filtering
echo 🏆 Auctions with bids will be marked as SOLD when they end
echo 📋 Sold auctions will be hidden from main listings but visible in personal auctions

REM Show PM2 status
echo.
echo [INFO] PM2 Status:
pm2 list

REM Show API endpoints
echo.
echo [INFO] New API Endpoints:
echo   GET /api/v1/auctions?excludeSold=true  - Main auctions (excludes sold)
echo   GET /api/v1/auctions?showOwn=true      - Personal auctions (includes sold)
echo   POST /api/v1/auctions/:id/mark-sold    - Mark auction as sold

echo.
echo [INFO] Testing the deployment:
echo   1. Test main auctions: curl "http://localhost:3000/api/v1/auctions?excludeSold=true"
echo   2. Test personal auctions: curl "http://localhost:3000/api/v1/auctions?showOwn=true"
echo   3. Check PM2 logs: pm2 logs wh40k-auction-backend

pause
