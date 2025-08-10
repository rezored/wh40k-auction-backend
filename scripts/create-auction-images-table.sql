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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auction_images_auction_id ON auction_images(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_images_auction_id_is_main ON auction_images(auction_id, is_main);
CREATE INDEX IF NOT EXISTS idx_auction_images_auction_id_order ON auction_images(auction_id, "order");
CREATE INDEX IF NOT EXISTS idx_auction_images_status ON auction_images(status);

-- Add foreign key constraint
ALTER TABLE auction_images 
ADD CONSTRAINT fk_auction_images_auction_id 
FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE;

-- Create enum for image status if it doesn't exist
DO $$ BEGIN
    CREATE TYPE image_status AS ENUM ('active', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the status column to use the enum
ALTER TABLE auction_images 
ALTER COLUMN status TYPE image_status USING status::image_status;

-- Add comments for documentation
COMMENT ON TABLE auction_images IS 'Stores multiple images for each auction with metadata and ordering';
COMMENT ON COLUMN auction_images.auction_id IS 'Reference to the auction this image belongs to';
COMMENT ON COLUMN auction_images.is_main IS 'Indicates if this is the main/primary image for the auction';
COMMENT ON COLUMN auction_images."order" IS 'Display order for the images';
COMMENT ON COLUMN auction_images.status IS 'Image status: active or deleted (soft delete)';
COMMENT ON COLUMN auction_images.alt_text IS 'Alternative text for accessibility';
