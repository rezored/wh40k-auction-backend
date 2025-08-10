#!/bin/bash

# Deploy notifications system
echo "Deploying notifications system..."

# Set database connection details
DB_HOST=${DB_HOST:-"127.0.0.1"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"wh40k_auction"}
DB_USER=${DB_USER:-"wh40k_user"}
DB_PASSWORD=${DB_PASSWORD:-"wh40k_password_2024"}

# Run the notifications table migration
echo "Creating notifications table..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/create-notifications-table.sql

if [ $? -eq 0 ]; then
    echo "✅ Notifications table created successfully!"
else
    echo "❌ Failed to create notifications table"
    exit 1
fi

echo "🎉 Notifications system deployment completed!"
echo ""
echo "The following endpoints are now available:"
echo "  GET    /api/v1/notifications"
echo "  GET    /api/v1/notifications/unread-count"
echo "  PUT    /api/v1/notifications/:id/read"
echo "  PUT    /api/v1/notifications/mark-all-read"
echo "  DELETE /api/v1/notifications/:id"
echo ""
echo "Notification types supported:"
echo "  - bid_placed"
echo "  - bid_outbid"
echo "  - offer_received"
echo "  - offer_accepted"
echo "  - offer_rejected"
echo "  - offer_expired"
echo "  - auction_ended"
echo "  - auction_won"
