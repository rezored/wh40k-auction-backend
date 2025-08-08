#!/bin/bash

# Development Setup Script for WH40K Auction Backend

echo "🚀 Setting up WH40K Auction Backend for development..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your database credentials."
else
    echo "✅ .env file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Docker is running
if command -v docker &> /dev/null; then
    echo "🐳 Docker detected. Starting services with Docker Compose..."
    docker-compose up -d
    
    echo "⏳ Waiting for database to be ready..."
    sleep 5
    
    echo "📦 Installing dependencies in Docker container..."
    docker-compose exec backend npm install
    
    echo "✅ Development environment ready!"
    echo "🌐 Backend: http://localhost:3000/api/v1"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "📋 Useful commands:"
    echo "  - View logs: docker-compose logs -f backend"
    echo "  - Stop services: docker-compose down"
    echo "  - Restart: docker-compose restart backend"
else
    echo "⚠️  Docker not found. Please ensure PostgreSQL is running locally."
    echo "📝 Make sure your .env file has the correct DATABASE_URL."
    echo ""
    echo "📋 To start the development server:"
    echo "  npm run start:dev"
fi

echo ""
echo "🎉 Setup complete!"
