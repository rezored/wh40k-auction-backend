#!/bin/bash

echo "🚀 Deploying updated excludeSold default behavior..."

# Navigate to project directory
cd "$(dirname "$0")/.."

# Build the NestJS application
echo "📦 Building NestJS application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart wh40k-auction-backend

if [ $? -ne 0 ]; then
    echo "❌ PM2 restart failed!"
    exit 1
fi

echo "✅ PM2 process restarted successfully!"

# Show PM2 status
echo "📊 PM2 Status:"
pm2 status

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Changes deployed:"
echo "   • GET /api/v1/auctions now defaults excludeSold=true"
echo "   • GET /api/v1/auctions/active now defaults excludeSold=true"
echo "   • GET /api/v1/auctions/my-auctions now forces excludeSold=false"
echo ""
echo "🔍 Test the changes:"
echo "   • Main listings: curl 'http://localhost:3000/api/v1/auctions'"
echo "   • My auctions: curl 'http://localhost:3000/api/v1/auctions/my-auctions' -H 'Authorization: Bearer YOUR_TOKEN'"
