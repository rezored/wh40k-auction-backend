-- WH40K Auction System - Add World Wars Category
-- This script adds the missing 'world-wars' category to the auction_category_enum

-- Add the new enum value to the existing enum type
ALTER TYPE auction_category_enum ADD VALUE IF NOT EXISTS 'world-wars';

-- Verify the enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'auction_category_enum');
