#!/bin/bash

# WH40K Auction System - Sold Auctions Deployment Script
# This script deploys the new excludeSold functionality

set -e  # Exit on any error

echo "🚀 Starting Sold Auctions deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Build NestJS backend
print_status "Building NestJS backend..."
npm run build

# Check if NestJS build was successful
if [ ! -f "dist/main.js" ]; then
    print_error "NestJS build failed. main.js not found in dist directory."
    exit 1
fi

print_status "NestJS build completed successfully!"

# Run database migration for sold auctions
print_status "Running database migration for sold auctions..."
if command -v psql &> /dev/null; then
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set. Please set it or run the migration manually."
        print_warning "You can run: psql -U your_user -d your_database -f scripts/migration-sold-auctions.sql"
    else
        psql "$DATABASE_URL" -f scripts/migration-sold-auctions.sql
        print_status "Database migration completed!"
    fi
else
    print_warning "psql not found. Please run the migration manually:"
    print_warning "psql -U your_user -d your_database -f scripts/migration-sold-auctions.sql"
fi

# Restart PM2 process
print_status "Restarting PM2 process..."
pm2 reload ecosystem.config.js --env production

# Check if PM2 restart was successful
if pm2 list | grep -q "wh40k-auction-backend"; then
    print_status "PM2 process restarted successfully!"
else
    print_error "PM2 process restart failed!"
    exit 1
fi

print_status "🎉 Sold Auctions deployment completed successfully!"
print_status "🔍 New excludeSold parameter is now available in auction filtering"
print_status "🏆 Auctions with bids will be marked as SOLD when they end"
print_status "📋 Sold auctions will be hidden from main listings but visible in personal auctions"

# Show PM2 status
echo ""
print_status "PM2 Status:"
pm2 list

# Show API endpoints
echo ""
print_status "New API Endpoints:"
echo "  GET /api/v1/auctions?excludeSold=true  - Main auctions (excludes sold)"
echo "  GET /api/v1/auctions?showOwn=true      - Personal auctions (includes sold)"
echo "  POST /api/v1/auctions/:id/mark-sold    - Mark auction as sold"

echo ""
print_status "Testing the deployment:"
echo "  1. Test main auctions: curl 'http://localhost:3000/api/v1/auctions?excludeSold=true'"
echo "  2. Test personal auctions: curl 'http://localhost:3000/api/v1/auctions?showOwn=true'"
echo "  3. Check PM2 logs: pm2 logs wh40k-auction-backend"
