#!/bin/bash

# Production Deployment Script for WH40K Auction Backend

set -e  # Exit on any error

echo "🚀 Deploying WH40K Auction Backend to production..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from env.example"
    echo "cp env.example .env"
    echo "Then edit .env with your production values."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 processes..."
pm2 delete wh40k-auction-backend 2>/dev/null || true

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on system boot
echo "🔧 Setting up PM2 startup script..."
pm2 startup

echo ""
echo "✅ Deployment complete!"
echo "📊 Monitor your application:"
echo "  - PM2 Dashboard: pm2 monit"
echo "  - View logs: pm2 logs wh40k-auction-backend"
echo "  - Restart: pm2 restart wh40k-auction-backend"
echo "  - Stop: pm2 stop wh40k-auction-backend"
echo ""
echo "🌐 Your application should be running on: http://localhost:3000/api/v1"
