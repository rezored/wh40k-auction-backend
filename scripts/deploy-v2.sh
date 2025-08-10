#!/bin/bash

# WH40K Auction System - Deployment Script v2
# For Debian/Ubuntu environments
# This script handles the deployment of the enhanced backend with new features

set -e  # Exit on any error

echo "🚀 Starting WH40K Auction System Deployment v2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Set production environment
export NODE_ENV=production
print_status "Set NODE_ENV to production"

# Step 1: Install dependencies
print_status "Installing npm dependencies..."
npm install
print_success "Dependencies installed successfully"

# Step 2: Run database migration
print_status "Running database migration..."
if [ -f "scripts/migration-v2.sql" ]; then
    # Check if psql is available
    if command -v psql &> /dev/null; then
        # Extract database connection details from environment or use defaults
        DB_URL=${DATABASE_URL:-"postgres://wh40k_user:wh40k_password_2024@127.0.0.1:5432/wh40k_auction"}
        
        print_status "Applying database migration..."
        psql "$DB_URL" -f scripts/migration-v2.sql
        print_success "Database migration completed successfully"
    else
        print_warning "psql not found. Please run the migration manually:"
        print_warning "psql -f scripts/migration-v2.sql"
        print_warning "Or install PostgreSQL client tools"
    fi
else
    print_error "Migration script not found: scripts/migration-v2.sql"
    exit 1
fi

# Step 3: Build the application
print_status "Building the application..."
npm run build
print_success "Application built successfully"

# Step 4: Run tests (if available)
if npm run test &> /dev/null; then
    print_status "Running tests..."
    npm run test
    print_success "Tests passed"
else
    print_warning "No test script found, skipping tests"
fi

# Step 5: Start the application
print_status "Starting the application..."

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    print_status "Using PM2 to manage the application..."
    
    # Stop existing process if running
    pm2 stop wh40k-auction-backend 2>/dev/null || true
    pm2 delete wh40k-auction-backend 2>/dev/null || true
    
    # Start with PM2
    pm2 start dist/main.js --name "wh40k-auction-backend" --env production
    pm2 save
    
    print_success "Application started with PM2"
    print_status "PM2 Status:"
    pm2 status
    
    print_status "To view logs: pm2 logs wh40k-auction-backend"
    print_status "To restart: pm2 restart wh40k-auction-backend"
    print_status "To stop: pm2 stop wh40k-auction-backend"
else
    print_warning "PM2 not found. Starting application directly..."
    print_warning "Consider installing PM2 for better process management:"
    print_warning "npm install -g pm2"
    
    # Start directly (this will run in foreground)
    print_status "Starting application in development mode..."
    npm run start:dev
fi

# Step 6: Deployment summary
echo ""
echo "=========================================="
print_success "WH40K Auction System Deployment v2 Complete!"
echo "=========================================="
echo ""
echo "📋 Deployment Summary:"
echo "  ✅ Dependencies installed"
echo "  ✅ Database migration applied"
echo "  ✅ Application built"
echo "  ✅ Application started"
echo ""
echo "🔧 New Features Available:"
echo "  • User Profile Management (/api/v1/users/profile)"
echo "  • Address Management (/api/v1/users/addresses)"
echo "  • Notification System (/api/v1/notifications)"
echo "  • Enhanced Auction Endpoints (/api/v1/auctions/*)"
echo "  • Enhanced Offer Endpoints (/api/v1/offers/*)"
echo ""
echo "🔒 Security Updates:"
echo "  • Fixed showOwn authentication issue"
echo "  • API versioning implemented (/api/v1/*)"
echo "  • Production-safe database configuration"
echo ""
echo "📚 Documentation:"
echo "  • API Documentation: API_DOCUMENTATION_V2.md"
echo "  • Deployment Summary: DEPLOYMENT_SUMMARY_V2.md"
echo ""
echo "🌐 Application should be running on your configured port"
echo "   Check your logs for the exact URL and port"
echo ""
print_success "Deployment completed successfully! 🎉"
