-- WH40K Auction System - Database Migration v2
-- This script adds new features: user profiles, addresses, and notifications

-- 1. Update Users table with new profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSON;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Create User Addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user_addresses
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default);

-- 3. Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('auction_won', 'offer_accepted', 'bid_outbid', 'auction_ending', 'general')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
    offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 4. Add trigger to update updated_at timestamp on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Add some sample data for testing (optional)
-- Insert sample user preferences for existing users
UPDATE users SET preferences = '{"emailNotifications": true, "smsNotifications": false, "currency": "USD"}'::json
WHERE preferences IS NULL;

-- 6. Create a view for user profiles with addresses
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.preferences,
    u.created_at,
    u.updated_at,
    json_agg(
        json_build_object(
            'id', ua.id,
            'street', ua.street,
            'city', ua.city,
            'state', ua.state,
            'postalCode', ua.postal_code,
            'country', ua.country,
            'isDefault', ua.is_default,
            'createdAt', ua.created_at,
            'updatedAt', ua.updated_at
        )
    ) FILTER (WHERE ua.id IS NOT NULL) as addresses
FROM users u
LEFT JOIN user_addresses ua ON u.id = ua.user_id
GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.preferences, u.created_at, u.updated_at;

-- 7. Create a function to get user's default address
CREATE OR REPLACE FUNCTION get_user_default_address(user_id_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    is_default BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id,
        ua.street,
        ua.city,
        ua.state,
        ua.postal_code,
        ua.country,
        ua.is_default
    FROM user_addresses ua
    WHERE ua.user_id = user_id_param AND ua.is_default = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 8. Create a function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    count_val INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_val
    FROM notifications
    WHERE recipient_id = user_id_param AND is_read = false;
    
    RETURN count_val;
END;
$$ LANGUAGE plpgsql;

-- Migration completed successfully
SELECT 'Database migration v2 completed successfully' as status;
