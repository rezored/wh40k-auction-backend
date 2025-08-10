-- Migration script to update auction statuses for sold auctions
-- This script should be run after deploying the new excludeSold functionality

-- Update auctions that have ended with bids to SOLD status
UPDATE auctions 
SET status = 'sold' 
WHERE status = 'ended' 
AND id IN (
    SELECT DISTINCT auction_id 
    FROM bids 
    WHERE auction_id = auctions.id
);

-- Update auctions that have ended without bids to ENDED status (already correct)
-- This is just for clarity - auctions without bids should remain 'ended'
UPDATE auctions 
SET status = 'ended' 
WHERE status = 'active' 
AND end_time < NOW() 
AND id NOT IN (
    SELECT DISTINCT auction_id 
    FROM bids 
    WHERE auction_id = auctions.id
);

-- Log the changes
SELECT 
    'Migration Summary' as info,
    COUNT(*) as total_auctions,
    SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold_auctions,
    SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END) as ended_auctions,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_auctions,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_auctions
FROM auctions;

-- Show detailed breakdown
SELECT 
    status,
    COUNT(*) as count,
    'auctions' as type
FROM auctions 
GROUP BY status
ORDER BY status;
