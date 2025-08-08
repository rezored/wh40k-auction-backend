#!/bin/bash

# Database Migration Script for WH40K Auction Backend
# This script helps migrate data between different environments

echo "🗄️  WH40K Auction Backend - Database Migration Tool"
echo ""

# Function to backup database
backup_db() {
    local source_url=$1
    local backup_file=$2
    
    echo "📦 Creating backup from: $source_url"
    echo "💾 Saving to: $backup_file"
    
    # Extract connection details from URL
    if [[ $source_url =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        local user="${BASH_REMATCH[1]}"
        local password="${BASH_REMATCH[2]}"
        local host="${BASH_REMATCH[3]}"
        local port="${BASH_REMATCH[4]}"
        local database="${BASH_REMATCH[5]}"
        
        PGPASSWORD=$password pg_dump -h $host -p $port -U $user -d $database > $backup_file
        
        if [ $? -eq 0 ]; then
            echo "✅ Backup created successfully!"
        else
            echo "❌ Backup failed!"
            exit 1
        fi
    else
        echo "❌ Invalid database URL format"
        exit 1
    fi
}

# Function to restore database
restore_db() {
    local target_url=$1
    local backup_file=$2
    
    echo "📥 Restoring backup to: $target_url"
    echo "📂 From file: $backup_file"
    
    # Extract connection details from URL
    if [[ $target_url =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        local user="${BASH_REMATCH[1]}"
        local password="${BASH_REMATCH[2]}"
        local host="${BASH_REMATCH[3]}"
        local port="${BASH_REMATCH[4]}"
        local database="${BASH_REMATCH[5]}"
        
        PGPASSWORD=$password psql -h $host -p $port -U $user -d $database < $backup_file
        
        if [ $? -eq 0 ]; then
            echo "✅ Database restored successfully!"
        else
            echo "❌ Restore failed!"
            exit 1
        fi
    else
        echo "❌ Invalid database URL format"
        exit 1
    fi
}

# Function to create test data
create_test_data() {
    local db_url=$1
    
    echo "🧪 Creating test data..."
    
    # Extract connection details from URL
    if [[ $db_url =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        local user="${BASH_REMATCH[1]}"
        local password="${BASH_REMATCH[2]}"
        local host="${BASH_REMATCH[3]}"
        local port="${BASH_REMATCH[4]}"
        local database="${BASH_REMATCH[5]}"
        
        # Create test users
        PGPASSWORD=$password psql -h $host -p $port -U $user -d $database << EOF
-- Create test users
INSERT INTO "user" (email, password, username, created_at, updated_at) VALUES
('test1@example.com', '\$2b\$10\$test.hash.here', 'testuser1', NOW(), NOW()),
('test2@example.com', '\$2b\$10\$test.hash.here', 'testuser2', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create test auctions
INSERT INTO auction (title, description, starting_price, current_price, end_date, seller_id, status, created_at, updated_at) VALUES
('Test Space Marine Squad', 'A squad of 10 Space Marines', 50.00, 50.00, NOW() + INTERVAL '7 days', 1, 'active', NOW(), NOW()),
('Test Ork Warband', 'A group of 15 Ork Boyz', 75.00, 75.00, NOW() + INTERVAL '5 days', 2, 'active', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create test bids
INSERT INTO bid (amount, auction_id, bidder_id, created_at, updated_at) VALUES
(55.00, 1, 2, NOW(), NOW()),
(80.00, 2, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

EOF
        
        if [ $? -eq 0 ]; then
            echo "✅ Test data created successfully!"
        else
            echo "❌ Failed to create test data!"
            exit 1
        fi
    else
        echo "❌ Invalid database URL format"
        exit 1
    fi
}

# Main menu
echo "Choose an option:"
echo "1) Backup current database"
echo "2) Restore database from backup"
echo "3) Create test data"
echo "4) Export data from laptop to home"
echo "5) Import data from laptop to home"
echo "6) Reset database (WARNING: This will delete all data!)"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        read -p "Enter database URL to backup: " db_url
        read -p "Enter backup filename (e.g., backup_$(date +%Y%m%d).sql): " backup_file
        backup_db "$db_url" "$backup_file"
        ;;
    2)
        read -p "Enter target database URL: " db_url
        read -p "Enter backup filename to restore: " backup_file
        restore_db "$db_url" "$backup_file"
        ;;
    3)
        read -p "Enter database URL: " db_url
        create_test_data "$db_url"
        ;;
    4)
        echo "📤 Exporting data from laptop..."
        echo "This will create a backup of your laptop's database."
        read -p "Enter laptop database URL: " laptop_url
        backup_file="laptop_backup_$(date +%Y%m%d_%H%M%S).sql"
        backup_db "$laptop_url" "$backup_file"
        echo "💾 Backup saved as: $backup_file"
        echo "📁 Copy this file to your home computer to import the data."
        ;;
    5)
        echo "📥 Importing data to home computer..."
        read -p "Enter backup filename: " backup_file
        read -p "Enter home database URL: " home_url
        restore_db "$home_url" "$backup_file"
        ;;
    6)
        echo "⚠️  WARNING: This will delete all data in the database!"
        read -p "Are you sure? Type 'YES' to confirm: " confirm
        if [ "$confirm" = "YES" ]; then
            read -p "Enter database URL: " db_url
            echo "🗑️  Resetting database..."
            
            # Extract connection details from URL
            if [[ $db_url =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
                local user="${BASH_REMATCH[1]}"
                local password="${BASH_REMATCH[2]}"
                local host="${BASH_REMATCH[3]}"
                local port="${BASH_REMATCH[4]}"
                local database="${BASH_REMATCH[5]}"
                
                PGPASSWORD=$password psql -h $host -p $port -U $user -d $database << EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
EOF
                
                if [ $? -eq 0 ]; then
                    echo "✅ Database reset successfully!"
                    echo "🔄 Restart your application to recreate tables."
                else
                    echo "❌ Database reset failed!"
                fi
            else
                echo "❌ Invalid database URL format"
            fi
        else
            echo "❌ Operation cancelled."
        fi
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "🎉 Operation completed!"
