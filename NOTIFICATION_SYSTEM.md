# WH40K Auction Backend - Notification System

## Overview

The notification system provides real-time notifications for all auction-related activities including bids, offers, and auction events. The system is fully integrated with the existing auction, bid, and offer services.

## Features

- **Real-time notifications** for all auction activities
- **Pagination support** for notification lists
- **Unread count tracking**
- **Multiple notification types** (bids, offers, auction events)
- **Automatic notification generation** from service events
- **RESTful API endpoints** following `/api/v1/notifications` pattern

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bid_placed', 'bid_outbid', 'offer_received', 'offer_accepted', 'offer_rejected', 'offer_expired', 'auction_ended', 'auction_won')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes

- `idx_notifications_user_id` - For fast user-specific queries
- `idx_notifications_is_read` - For unread count queries
- `idx_notifications_created_at` - For chronological ordering
- `idx_notifications_type` - For type-based filtering

## API Endpoints

### Get Notifications
```
GET /api/v1/notifications?page=1&limit=50&unreadOnly=false
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `unreadOnly` (optional): Filter unread notifications only (default: false)

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "userId": 1,
      "type": "bid_placed",
      "title": "New Bid Received",
      "message": "John Doe placed a bid of €100 on \"Space Marine\"",
      "data": {
        "auctionId": 1,
        "auctionTitle": "Space Marine",
        "bidAmount": 100,
        "bidderName": "John Doe"
      },
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

### Get Unread Count
```
GET /api/v1/notifications/unread-count
```

**Response:**
```json
{
  "count": 5
}
```

### Mark Notification as Read
```
PUT /api/v1/notifications/:id/read
```

**Response:**
```json
{
  "success": true
}
```

### Mark All Notifications as Read
```
PUT /api/v1/notifications/mark-all-read
```

**Response:**
```json
{
  "success": true
}
```

### Delete Notification
```
DELETE /api/v1/notifications/:id
```

**Response:**
```json
{
  "success": true
}
```

## Notification Types

### 1. Bid Notifications

#### `bid_placed`
- **Triggered when:** Someone places a bid on an auction
- **Recipient:** Auction owner
- **Data includes:** auctionId, auctionTitle, bidAmount, bidderName

#### `bid_outbid`
- **Triggered when:** Someone outbids a previous bidder
- **Recipient:** Previous bidders
- **Data includes:** auctionId, auctionTitle, bidAmount

### 2. Offer Notifications

#### `offer_received`
- **Triggered when:** Someone makes an offer on a direct sale
- **Recipient:** Auction owner
- **Data includes:** auctionId, auctionTitle, offerAmount, offererName

#### `offer_accepted`
- **Triggered when:** An offer is accepted
- **Recipient:** Offer maker
- **Data includes:** auctionId, auctionTitle, offerAmount

#### `offer_rejected`
- **Triggered when:** An offer is rejected
- **Recipient:** Offer maker
- **Data includes:** auctionId, auctionTitle, offerAmount

#### `offer_expired`
- **Triggered when:** An offer expires
- **Recipient:** Offer maker
- **Data includes:** auctionId, auctionTitle, offerAmount

### 3. Auction Notifications

#### `auction_ended`
- **Triggered when:** An auction ends
- **Recipient:** Auction owner
- **Data includes:** auctionId, auctionTitle

#### `auction_won`
- **Triggered when:** An auction ends with a winner
- **Recipient:** Winning bidder
- **Data includes:** auctionId, auctionTitle, finalPrice

## Integration Points

### Bids Service Integration

The notification system is automatically integrated with the bids service:

```typescript
// In BidsService.placeBid()
await this.sendBidNotifications(auction, savedBid);
```

**Notifications sent:**
1. `bid_placed` to auction owner
2. `bid_outbid` to previous bidders

### Offers Service Integration

The notification system is automatically integrated with the offers service:

```typescript
// In OffersService.createOffer()
await this.sendOfferNotification(savedOffer);

// In OffersService.respondToOffer()
await this.sendOfferResponseNotification(offer, response);
```

**Notifications sent:**
1. `offer_received` when offer is created
2. `offer_accepted` or `offer_rejected` when offer is responded to

### Auctions Service Integration

The notification system is automatically integrated with the auctions service:

```typescript
// In AuctionsService.endAuction()
await this.sendAuctionEndNotifications(endedAuction);
```

**Notifications sent:**
1. `auction_ended` to auction owner
2. `auction_won` to winning bidder (if applicable)

## Service Architecture

### NotificationsService

The core service that handles all notification operations:

```typescript
@Injectable()
export class NotificationsService {
  // Core CRUD operations
  async createNotification(userId: number, data: CreateNotificationDto): Promise<Notification>
  async getUserNotifications(userId: number, query: GetNotificationsQuery): Promise<NotificationResponse>
  async getUnreadCount(userId: number): Promise<number>
  async markAsRead(notificationId: string, userId: number): Promise<void>
  async markAllAsRead(userId: number): Promise<void>
  async deleteNotification(notificationId: string, userId: number): Promise<void>

  // Helper methods for specific notification types
  async notifyBidPlaced(auctionOwnerId: number, auctionTitle: string, bidAmount: number, bidderName: string, auctionId: number): Promise<void>
  async notifyBidOutbid(userId: number, auctionTitle: string, bidAmount: number, auctionId: number): Promise<void>
  async notifyOfferReceived(auctionOwnerId: number, auctionTitle: string, offerAmount: number, offererName: string, auctionId: number): Promise<void>
  async notifyOfferAccepted(offererId: number, auctionTitle: string, offerAmount: number, auctionId: number): Promise<void>
  async notifyOfferRejected(offererId: number, auctionTitle: string, offerAmount: number, auctionId: number): Promise<void>
  async notifyOfferExpired(offererId: number, auctionTitle: string, offerAmount: number, auctionId: number): Promise<void>
  async notifyAuctionWon(winnerId: number, auctionTitle: string, finalPrice: number, auctionId: number): Promise<void>
  async notifyAuctionEnded(auctionOwnerId: number, auctionTitle: string, auctionId: number): Promise<void>
}
```

### NotificationsController

RESTful controller handling all notification API endpoints:

```typescript
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  @Get()
  async getNotifications(@Req() req, @Query() query: GetNotificationsQuery): Promise<NotificationResponse>

  @Get('unread-count')
  async getUnreadCount(@Req() req): Promise<UnreadCountResponse>

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req): Promise<MarkAsReadResponse>

  @Put('mark-all-read')
  async markAllAsRead(@Req() req): Promise<MarkAllAsReadResponse>

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Req() req): Promise<DeleteNotificationResponse>
}
```

## Security Considerations

1. **User Isolation:** Users can only access their own notifications
2. **Input Validation:** All notification data is validated before storage
3. **Rate Limiting:** API endpoints are protected by global rate limiting
4. **Authentication:** All endpoints require JWT authentication
5. **Data Sanitization:** User input is sanitized in notification messages

## Performance Considerations

1. **Pagination:** Default 50 notifications per page to prevent large payloads
2. **Database Indexes:** Optimized indexes for common query patterns
3. **Error Handling:** Notification failures don't break core functionality
4. **Async Processing:** Notifications are sent asynchronously to avoid blocking

## Deployment

### Database Migration

Run the migration script to create the notifications table:

```bash
./scripts/deploy-notifications.sh
```

### Environment Variables

No additional environment variables are required. The system uses existing database configuration.

## Testing

Comprehensive tests are included in `src/notifications/notifications.service.spec.ts`:

```bash
npm test -- notifications.service.spec.ts
```

## Frontend Integration

The notification system is designed to work seamlessly with the existing frontend:

1. **Real-time polling:** Frontend can poll `/api/v1/notifications/unread-count` for updates
2. **Notification list:** Use `/api/v1/notifications` with pagination
3. **Mark as read:** Call `/api/v1/notifications/:id/read` when user clicks notification
4. **Mark all read:** Call `/api/v1/notifications/mark-all-read` for bulk actions

## Error Handling

The notification system includes comprehensive error handling:

1. **Graceful degradation:** Notification failures don't break core functionality
2. **Error logging:** All errors are logged for debugging
3. **User feedback:** Appropriate error responses for API endpoints
4. **Data validation:** Input validation prevents invalid notifications

## Future Enhancements

Potential future improvements:

1. **WebSocket support** for real-time notifications
2. **Email notifications** integration
3. **Push notifications** for mobile apps
4. **Notification preferences** per user
5. **Notification templates** for customization
6. **Bulk operations** for notification management
7. **Analytics** for notification engagement
