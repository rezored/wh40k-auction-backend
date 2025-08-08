@echo off
REM Development Setup Script for WH40K Auction Backend (Windows)

echo 🚀 Setting up WH40K Auction Backend for development...

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created. Please edit it with your database credentials.
) else (
    echo ✅ .env file already exists.
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% == 0 (
    echo 🐳 Docker detected. Starting services with Docker Compose...
    docker-compose up -d
    
    echo ⏳ Waiting for database to be ready...
    timeout /t 5 /nobreak >nul
    
    echo 📦 Installing dependencies in Docker container...
    docker-compose exec backend npm install
    
    echo ✅ Development environment ready!
    echo 🌐 Backend: http://localhost:3000/api/v1
    echo 🗄️  Database: localhost:5432
    echo.
    echo 📋 Useful commands:
    echo   - View logs: docker-compose logs -f backend
    echo   - Stop services: docker-compose down
    echo   - Restart: docker-compose restart backend
) else (
    echo ⚠️  Docker not found. Please ensure PostgreSQL is running locally.
    echo 📝 Make sure your .env file has the correct DATABASE_URL.
    echo.
    echo 📋 To start the development server:
    echo   npm run start:dev
)

echo.
echo 🎉 Setup complete!
pause
