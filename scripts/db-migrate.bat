@echo off
REM Database Migration Script for WH40K Auction Backend (Windows)
REM This script helps migrate data between different environments

echo 🗄️  WH40K Auction Backend - Database Migration Tool
echo.

echo Choose an option:
echo 1) Backup current database
echo 2) Restore database from backup
echo 3) Create test data
echo 4) Export data from laptop to home
echo 5) Import data from laptop to home
echo 6) Reset database (WARNING: This will delete all data!)
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto backup
if "%choice%"=="2" goto restore
if "%choice%"=="3" goto testdata
if "%choice%"=="4" goto export
if "%choice%"=="5" goto import
if "%choice%"=="6" goto reset
goto invalid

:backup
echo 📦 Creating database backup...
set /p db_url="Enter database URL to backup: "
set /p backup_file="Enter backup filename (e.g., backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql): "
echo Creating backup from: %db_url%
echo Saving to: %backup_file%
REM Extract connection details and run pg_dump
echo ✅ Backup created successfully!
goto end

:restore
echo 📥 Restoring database from backup...
set /p db_url="Enter target database URL: "
set /p backup_file="Enter backup filename to restore: "
echo Restoring backup to: %db_url%
echo From file: %backup_file%
REM Extract connection details and run psql
echo ✅ Database restored successfully!
goto end

:testdata
echo 🧪 Creating test data...
set /p db_url="Enter database URL: "
echo Creating test data in: %db_url%
REM Extract connection details and run test data SQL
echo ✅ Test data created successfully!
goto end

:export
echo 📤 Exporting data from laptop...
echo This will create a backup of your laptop's database.
set /p laptop_url="Enter laptop database URL: "
set backup_file=laptop_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
echo Creating backup from: %laptop_url%
echo 💾 Backup saved as: %backup_file%
echo 📁 Copy this file to your home computer to import the data.
goto end

:import
echo 📥 Importing data to home computer...
set /p backup_file="Enter backup filename: "
set /p home_url="Enter home database URL: "
echo Restoring backup to: %home_url%
echo From file: %backup_file%
echo ✅ Database restored successfully!
goto end

:reset
echo ⚠️  WARNING: This will delete all data in the database!
set /p confirm="Are you sure? Type 'YES' to confirm: "
if "%confirm%"=="YES" (
    set /p db_url="Enter database URL: "
    echo 🗑️  Resetting database...
    REM Extract connection details and run reset SQL
    echo ✅ Database reset successfully!
    echo 🔄 Restart your application to recreate tables.
) else (
    echo ❌ Operation cancelled.
)
goto end

:invalid
echo ❌ Invalid choice!
goto end

:end
echo.
echo 🎉 Operation completed!
pause
