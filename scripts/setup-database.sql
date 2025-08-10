-- Complete Database Setup Script for WH40K Auction Backend
-- This script creates all necessary tables and initial data

-- Create users table
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create auctions table
CREATE TABLE IF NOT EXISTS auctions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    starting_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    reserve_price DECIMAL(10,2),
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    image_url VARCHAR(500), -- Legacy field - will be deprecated
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create auction_images table
CREATE TABLE IF NOT EXISTS auction_images (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    "order" INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    alt_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    bidder_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auctions_owner_id ON auctions(owner_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_end_date ON auctions(end_date);
CREATE INDEX IF NOT EXISTS idx_auctions_current_price ON auctions(current_price);

CREATE INDEX IF NOT EXISTS idx_auction_images_auction_id ON auction_images(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_images_auction_id_is_main ON auction_images(auction_id, is_main);
CREATE INDEX IF NOT EXISTS idx_auction_images_auction_id_order ON auction_images(auction_id, "order");
CREATE INDEX IF NOT EXISTS idx_auction_images_status ON auction_images(status);

CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(amount);

CREATE INDEX IF NOT EXISTS idx_offers_auction_id ON offers(auction_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE image_status AS ENUM ('active', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auction_status AS ENUM ('active', 'ended', 'cancelled', 'sold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update columns to use enums
ALTER TABLE auction_images 
ALTER COLUMN status TYPE image_status USING status::image_status;

ALTER TABLE auctions 
ALTER COLUMN status TYPE auction_status USING status::auction_status;

ALTER TABLE offers 
ALTER COLUMN status TYPE offer_status USING status::offer_status;

-- Add comments for documentation
COMMENT ON TABLE "user" IS 'User accounts for the auction system';
COMMENT ON TABLE auctions IS 'Auction listings with details and pricing';
COMMENT ON TABLE auction_images IS 'Multiple images for each auction with metadata and ordering';
COMMENT ON TABLE bids IS 'Bids placed on auctions';
COMMENT ON TABLE offers IS 'Direct offers made on auctions';

-- Insert sample data (optional - for testing)
-- INSERT INTO "user" (username, email, password, role) VALUES 
-- ('admin', 'admin@example.com', '$2b$10$example_hash', 'admin'),
-- ('user1', 'user1@example.com', '$2b$10$example_hash', 'user');

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wh40k_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wh40k_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO wh40k_user;
