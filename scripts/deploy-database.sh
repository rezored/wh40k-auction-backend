#!/bin/bash

# Database Deployment Script for WH40K Auction Backend
# This script sets up the database and restarts the application

set -e  # Exit on any error

echo "🚀 Starting database deployment for WH40K Auction Backend..."

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
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Load environment variables
if [ -f ".env" ]; then
    print_status "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    print_warning "No .env file found, using default values..."
    export DATABASE_URL="postgres://wh40k_user:wh40k_password_2024@127.0.0.1:5432/wh40k_auction"
fi

# Extract database connection details
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

print_status "Database connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Check if PostgreSQL is running
print_status "Checking PostgreSQL service status..."
if ! sudo systemctl is-active --quiet postgresql; then
    print_warning "PostgreSQL is not running. Starting it now..."
    sudo systemctl start postgresql
    sleep 3
fi

# Check PostgreSQL status
PG_STATUS=$(sudo systemctl is-active postgresql)
if [ "$PG_STATUS" != "active" ]; then
    print_error "PostgreSQL is not running properly. Status: $PG_STATUS"
    print_error "Please check PostgreSQL configuration and try again."
    exit 1
fi

print_status "PostgreSQL is running (status: $PG_STATUS)"

# Test database connection
print_status "Testing database connection..."
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    print_error "Cannot connect to database. Please check your credentials and try again."
    exit 1
fi

print_status "Database connection successful!"

# Stop the PM2 process
print_status "Stopping PM2 process..."
if pm2 list | grep -q "wh40k-auction-backend"; then
    pm2 stop wh40k-auction-backend
    pm2 delete wh40k-auction-backend
    print_status "PM2 process stopped and deleted"
else
    print_status "No PM2 process found"
fi

# Drop and recreate database (WARNING: This will delete all data!)
print_warning "This will delete all existing data in the database. Are you sure? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    print_status "Dropping and recreating database..."
    
    # Connect to postgres database to drop/recreate
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";"
    
    print_status "Database recreated successfully!"
else
    print_status "Skipping database recreation. Using existing database."
fi

# Run the database setup script
print_status "Running database setup script..."
if [ -f "scripts/setup-database.sql" ]; then
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f scripts/setup-database.sql
    print_status "Database setup script completed!"
else
    print_error "Database setup script not found: scripts/setup-database.sql"
    exit 1
fi

# Verify tables were created
print_status "Verifying database tables..."
TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "\dt" | wc -l)
print_status "Found $TABLES tables in the database"

# Build the project
print_status "Building the project..."
npm run build

# Start PM2 process
print_status "Starting PM2 process..."
pm2 start ecosystem.config.js --env production

# Wait a moment for the application to start
sleep 5

# Check PM2 status
print_status "Checking PM2 status..."
pm2 list

# Check logs for any errors
print_status "Checking application logs..."
pm2 logs wh40k-auction-backend --lines 20

print_status "🎉 Database deployment completed!"
print_status "Your application should now be running with a properly configured database."
print_status "Check the logs above for any errors or warnings."
