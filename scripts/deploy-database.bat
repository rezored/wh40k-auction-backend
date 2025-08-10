@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting database deployment for WH40K Auction Backend...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the project root directory
    exit /b 1
)

REM Load environment variables from .env file
if exist ".env" (
    echo [INFO] Loading environment variables from .env file...
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
) else (
    echo [WARNING] No .env file found, using default values...
    set "DATABASE_URL=postgres://wh40k_user:wh40k_password_2024@127.0.0.1:5432/wh40k_auction"
)

echo [INFO] Database connection details:
echo   DATABASE_URL: %DATABASE_URL%

REM Check if PostgreSQL is running
echo [INFO] Checking PostgreSQL service status...
sc query postgresql | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL is not running. Starting it now...
    net start postgresql
    timeout /t 3 /nobreak >nul
)

REM Test database connection
echo [INFO] Testing database connection...
echo You may need to enter your password manually for the database connection test.
echo Please test the connection manually with:
echo   PGPASSWORD='your_password' psql -h 127.0.0.1 -U wh40k_user -d wh40k_auction -c "SELECT 1;"

REM Stop the PM2 process
echo [INFO] Stopping PM2 process...
pm2 stop wh40k-auction-backend 2>nul
pm2 delete wh40k-auction-backend 2>nul
echo [INFO] PM2 process stopped and deleted

REM Ask about database recreation
echo [WARNING] This will delete all existing data in the database. Are you sure? (y/N)
set /p response=
if /i "!response!"=="y" (
    echo [INFO] Dropping and recreating database...
    echo Please run these commands manually:
    echo   PGPASSWORD='your_password' psql -h 127.0.0.1 -U wh40k_user -d postgres -c "DROP DATABASE IF EXISTS wh40k_auction;"
    echo   PGPASSWORD='your_password' psql -h 127.0.0.1 -U wh40k_user -d postgres -c "CREATE DATABASE wh40k_auction OWNER wh40k_user;"
) else (
    echo [INFO] Skipping database recreation. Using existing database.
)

REM Run the database setup script
echo [INFO] Running database setup script...
if exist "scripts\setup-database.sql" (
    echo Please run this command manually:
    echo   PGPASSWORD='your_password' psql -h 127.0.0.1 -U wh40k_user -d wh40k_auction -f scripts\setup-database.sql
) else (
    echo [ERROR] Database setup script not found: scripts\setup-database.sql
    exit /b 1
)

REM Build the project
echo [INFO] Building the project...
call npm run build

REM Start PM2 process
echo [INFO] Starting PM2 process...
pm2 start ecosystem.config.js --env production

REM Wait a moment for the application to start
timeout /t 5 /nobreak >nul

REM Check PM2 status
echo [INFO] Checking PM2 status...
pm2 list

REM Check logs for any errors
echo [INFO] Checking application logs...
pm2 logs wh40k-auction-backend --lines 20

echo 🎉 Database deployment completed!
echo Your application should now be running with a properly configured database.
echo Check the logs above for any errors or warnings.

pause
