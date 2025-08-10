# Sold Auctions Implementation

This document outlines the implementation of sold auctions functionality in the WH40K Auction Backend.

## Overview

The system now properly handles sold auctions with the following key features:
- Automatic status updates when auctions end
- Filtering options to exclude/include sold auctions
- Manual auction status management
- Default behavior optimized for different use cases

## API Endpoints

### 1. Get All Auctions (Main Listings)
```
GET /api/v1/auctions
```

**Default Behavior**: `excludeSold=true` (sold auctions are hidden by default)

**Parameters**:
- `excludeSold` (optional): `true`/`false` - defaults to `true` for main listings
- Other standard auction filters

**Use Case**: Main auction browsing page where users want to see only active/available auctions.

### 2. Get My Auctions (Personal Listings)
```
GET /api/v1/auctions/my-auctions
```

**Default Behavior**: `excludeSold=false` (sold auctions are always included)

**Parameters**:
- Standard auction filters (excludeSold is forced to `false`)

**Use Case**: Personal dashboard where users want to see all their auctions, including sold ones.

### 3. Get Active Auctions
```
GET /api/v1/auctions/active
```

**Default Behavior**: `excludeSold=true` (sold auctions are hidden by default)

**Parameters**:
- `excludeSold` (optional): `true`/`false` - defaults to `true`
- Other standard auction filters

**Use Case**: Filtered view showing only active auctions.

### 4. Mark Auction as Sold (Manual)
```
POST /api/v1/auctions/:id/mark-sold
```

**Authentication**: Required (JWT)

**Use Case**: Allow auction owners to manually mark their auctions as sold.

## Default Behavior Summary

| Endpoint | Default excludeSold | Purpose |
|----------|-------------------|---------|
| `/api/v1/auctions` | `true` | Main listings - hide sold items |
| `/api/v1/auctions/my-auctions` | `false` (forced) | Personal dashboard - show all items |
| `/api/v1/auctions/active` | `true` | Active auctions only |

## Auction Status Management

### Automatic Status Updates

The system automatically updates auction statuses based on the following rules:

1. **When auction end time is reached**:
   - If auction has bids → Status becomes `SOLD`
   - If auction has no bids → Status becomes `ENDED`

2. **Status check runs**:
   - On every auction listing request
   - When retrieving individual auctions
   - During bid placement

### Manual Status Management

Auction owners can manually mark their auctions as sold using the `mark-sold` endpoint.

## Database Schema

### Auction Status Enum
```typescript
enum AuctionStatus {
    ACTIVE = 'active',
    ENDED = 'ended',
    SOLD = 'sold',
    CANCELLED = 'cancelled'
}
```

### Key Fields
- `status`: Current auction status
- `endTime`: When the auction ends
- `bids`: Related bids (used to determine if auction should be marked as sold)

## Implementation Details

### Service Layer (`AuctionsService`)

#### Filtering Logic
```typescript
// In applyFilters method
if (filters.excludeSold === true) {
    console.log('🔍 Excluding sold auctions from results');
    queryBuilder.andWhere('auction.status != :soldStatus', { soldStatus: AuctionStatus.SOLD });
}
```

#### Status Update Logic
```typescript
// In checkAndUpdateAuctionStatus method
if (auction.endTime <= now) {
    if (auction.bids && auction.bids.length > 0) {
        auction.status = AuctionStatus.SOLD;
        console.log(`🏆 Auction ${auction.id} marked as SOLD - has ${auction.bids.length} bids`);
    } else {
        auction.status = AuctionStatus.ENDED;
        console.log(`⏰ Auction ${auction.id} marked as ENDED - no bids`);
    }
    await this.repo.save(auction);
}
```

### Controller Layer (`AuctionsController`)

#### Default Parameter Setting
```typescript
// In getAllAuctions method
if (filters.excludeSold === undefined) {
    filters.excludeSold = true;
    console.log(`🔍 excludeSold filter set to default: true (main listings)`);
}

// In getMyAuctions method
filters.excludeSold = false;
console.log(`🔍 excludeSold filter set to false for My Auctions section`);
```

## Deployment

### Quick Deployment
```bash
# Linux/Mac
./scripts/deploy-exclude-sold-defaults.sh

# Windows
scripts/deploy-exclude-sold-defaults.bat
```

### Manual Deployment
1. Build the application: `npm run build`
2. Restart PM2: `pm2 restart wh40k-auction-backend`

## Testing

### Test Scenarios

1. **Main Listings (excludeSold=true by default)**:
   ```bash
   curl 'http://localhost:3000/api/v1/auctions'
   ```
   - Should exclude sold auctions
   - Should include active and ended auctions

2. **My Auctions (excludeSold=false forced)**:
   ```bash
   curl 'http://localhost:3000/api/v1/auctions/my-auctions' \
     -H 'Authorization: Bearer YOUR_TOKEN'
   ```
   - Should include all auctions (active, ended, sold)
   - Should show user's complete auction history

3. **Explicit Parameter Override**:
   ```bash
   curl 'http://localhost:3000/api/v1/auctions?excludeSold=false'
   ```
   - Should include sold auctions even in main listings

### Expected Behavior

- **Main auction page**: Only shows available auctions (no sold items)
- **My Auctions page**: Shows complete auction history including sold items
- **Active auctions**: Only shows currently active auctions
- **Status updates**: Automatic when auctions end with/without bids

## Frontend Integration

### Angular Frontend Considerations

The frontend at https://github.com/rezored/wh40k-auction-frontend should:

1. **Main Auctions Page**:
   - Use `/api/v1/auctions` (excludeSold=true by default)
   - No need to pass excludeSold parameter

2. **My Auctions Page**:
   - Use `/api/v1/auctions/my-auctions` (excludeSold=false forced)
   - Will automatically include sold auctions

3. **Optional Override**:
   - Can pass `excludeSold=false` to main endpoint to show sold items
   - Useful for admin views or special filters

### API Response Format

All endpoints return the same response format:
```typescript
interface PaginatedAuctionsResponseDto {
    auctions: AuctionResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
```

## Troubleshooting

### Common Issues

1. **Sold auctions still showing in main listings**:
   - Check if `excludeSold` parameter is being explicitly set to `false`
   - Verify the auction status is actually `SOLD`

2. **Auction status not updating**:
   - Check if `endTime` is in the past
   - Verify the auction has bids if expecting `SOLD` status

3. **My Auctions not showing sold items**:
   - Verify authentication token is valid
   - Check if the endpoint is correctly forcing `excludeSold=false`

### Debug Logging

The system provides detailed logging:
- `🔍 excludeSold filter set to default: true (main listings)`
- `🔍 excludeSold filter set to false for My Auctions section`
- `🏆 Auction X marked as SOLD - has Y bids`
- `⏰ Auction X marked as ENDED - no bids`

## Migration Notes

### Database Migration
Run the migration script to update existing data:
```bash
psql -d your_database -f scripts/migration-sold-auctions.sql
```

This script updates existing ended auctions with bids to have `SOLD` status.

### Backward Compatibility
- All existing API calls continue to work
- New default behavior only affects requests without explicit `excludeSold` parameter
- Explicit parameter values override defaults
