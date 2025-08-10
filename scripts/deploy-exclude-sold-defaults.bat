@echo off
echo 🚀 Deploying updated excludeSold default behavior...

REM Navigate to project directory
cd /d "%~dp0\.."

REM Build the NestJS application
echo 📦 Building NestJS application...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✅ Build completed successfully!

REM Restart PM2 process
echo 🔄 Restarting PM2 process...
call pm2 restart wh40k-auction-backend

if %errorlevel% neq 0 (
    echo ❌ PM2 restart failed!
    exit /b 1
)

echo ✅ PM2 process restarted successfully!

REM Show PM2 status
echo 📊 PM2 Status:
call pm2 status

echo 🎉 Deployment completed successfully!
echo.
echo 📋 Changes deployed:
echo    • GET /api/v1/auctions now defaults excludeSold=true
echo    • GET /api/v1/auctions/active now defaults excludeSold=true
echo    • GET /api/v1/auctions/my-auctions now forces excludeSold=false
echo.
echo 🔍 Test the changes:
echo    • Main listings: curl "http://localhost:3000/api/v1/auctions"
echo    • My auctions: curl "http://localhost:3000/api/v1/auctions/my-auctions" -H "Authorization: Bearer YOUR_TOKEN"

pause
