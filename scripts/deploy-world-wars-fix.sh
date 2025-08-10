#!/bin/bash

# WH40K Auction System - Deploy World Wars Category Fix
# This script applies the database migration to add the missing 'world-wars' category

set -e

echo "🔧 Deploying World Wars Category Fix..."

# Load environment variables
if [ -f "../env.production" ]; then
    export $(cat ../env.production | grep -v '^#' | xargs)
    echo "📋 Loaded production environment variables"
elif [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
    echo "📋 Loaded development environment variables"
else
    echo "⚠️  No environment file found, using system defaults"
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-wh40k_auction}
DB_USER=${DB_USER:-wh40k_user}

echo "🗄️  Connecting to database: $DB_NAME on $DB_HOST:$DB_PORT"

# Apply the migration
echo "📝 Applying database migration..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f add-world-wars-category.sql

echo "✅ World Wars Category Fix deployed successfully!"
echo "🔄 Restarting the application..."

# Restart the application if PM2 is available
if command -v pm2 &> /dev/null; then
    pm2 restart wh40k-auction-backend
    echo "🚀 Application restarted via PM2"
else
    echo "⚠️  PM2 not found, please restart the application manually"
fi

echo "🎉 Deployment complete!"
