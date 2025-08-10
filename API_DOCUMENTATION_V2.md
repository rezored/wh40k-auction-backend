# WH40K Auction System - API Documentation v2

## Overview
This document describes the enhanced API endpoints for the WH40K Auction System, including user profile management, address handling, and notification systems.

## Base URL
All endpoints are prefixed with `/api/v1`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Responses
All endpoints return consistent error responses:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "details": {}
}
```

---

## 1. User Profile Management

### 1.1 Get User Profile
```
GET /api/v1/users/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "warlord42",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "addresses": [
    {
      "id": 1,
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false,
    "currency": "USD"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 1.2 Update User Profile
```
PUT /api/v1/users/profile
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "username": "new_username",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false,
    "currency": "USD"
  }
}
```

### 1.3 Change Password
```
POST /api/v1/users/change-password
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123!",
  "confirmPassword": "newPassword123!"
}
```

---

## 2. Address Management

### 2.1 Get User Addresses
```
GET /api/v1/users/addresses
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "isDefault": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 2.2 Add New Address
```
POST /api/v1/users/addresses
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "street": "456 Oak Ave",
  "city": "Los Angeles",
  "state": "CA",
  "postalCode": "90210",
  "country": "USA",
  "isDefault": false
}
```

### 2.3 Update Address
```
PUT /api/v1/users/addresses/{addressId}
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "street": "456 Oak Ave",
  "city": "Los Angeles",
  "state": "CA",
  "postalCode": "90210",
  "country": "USA",
  "isDefault": true
}
```

### 2.4 Delete Address
```
DELETE /api/v1/users/addresses/{addressId}
Authorization: Bearer <jwt_token>
```

### 2.5 Set Default Address
```
POST /api/v1/users/addresses/{addressId}/set-default
Authorization: Bearer <jwt_token>
```

### 2.6 Get User's Default Address
```
GET /api/v1/users/{userId}/default-address
Authorization: Bearer <jwt_token>
```

---

## 3. Notification System

### 3.1 Get User Notifications
```
GET /api/v1/notifications?page=1&limit=20&unreadOnly=false
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "auction_won",
      "title": "Congratulations! You won \"Space Marine Army\"",
      "message": "You won the auction \"Space Marine Army\" for $150.00. Please check your email for shipping details.",
      "auctionId": 123,
      "offerId": null,
      "recipientId": 1,
      "senderId": null,
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "metadata": {
        "winnerAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "postalCode": "10001",
          "country": "USA"
        },
        "finalPrice": 150.00
      }
    }
  ],
  "total": 1,
  "unreadCount": 1
}
```

### 3.2 Mark Notification as Read
```
PUT /api/v1/notifications/{notificationId}/read
Authorization: Bearer <jwt_token>
```

### 3.3 Mark All Notifications as Read
```
PUT /api/v1/notifications/read-all
Authorization: Bearer <jwt_token>
```

### 3.4 Delete Notification
```
DELETE /api/v1/notifications/{notificationId}
Authorization: Bearer <jwt_token>
```

### 3.5 Get Unread Count
```
GET /api/v1/notifications/unread-count
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "count": 5
}
```

---

## 4. Enhanced Auction Endpoints

### 4.1 Get Auction Winner
```
GET /api/v1/auctions/{auctionId}/winner
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "winner": {
    "id": 1,
    "email": "winner@example.com",
    "username": "winner"
  },
  "winningBid": {
    "id": 1,
    "amount": 150.00,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "finalPrice": 150.00
}
```

### 4.2 Get Winner Address
```
GET /api/v1/auctions/{auctionId}/winner-address
Authorization: Bearer <jwt_token>
```

### 4.3 Get Shipping Information
```
GET /api/v1/auctions/{auctionId}/shipping/{userId}
Authorization: Bearer <jwt_token>
```

### 4.4 Notify Auction Winner
```
POST /api/v1/auctions/{auctionId}/notify-winner
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "winnerId": 1,
  "winnerAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "finalPrice": 150.00,
  "auctionTitle": "Space Marine Army",
  "message": "Congratulations on winning the auction!"
}
```

---

## 5. Enhanced Offer Endpoints

### 5.1 Accept Offer with Address
```
POST /api/v1/offers/{offerId}/accept-with-address
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "response": "accept",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  }
}
```

### 5.2 Notify Offer Accepted
```
POST /api/v1/offers/{offerId}/notify-accepted
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "buyerId": 1,
  "buyerAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "offerAmount": 100.00,
  "auctionTitle": "Space Marine Army",
  "message": "Your offer has been accepted!"
}
```

---

## 6. Updated Auction Endpoints

### 6.1 Get All Auctions (Fixed Authentication)
```
GET /api/v1/auctions?showOwn=true&sortBy=newest&page=1&limit=12
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `showOwn` or `show_own`: Filter to show only user's own auctions
- `sortBy`: Sort order (newest, oldest, price_asc, price_desc)
- `page`: Page number
- `limit`: Items per page
- `category`: Filter by category
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `search`: Search term

---

## 7. Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED_FOR_OWN_AUCTIONS` | Authentication required to view own auctions | 401 |
| `INVALID_ADDRESS_FORMAT` | Address validation failed | 400 |
| `ADDRESS_NOT_FOUND` | Requested address doesn't exist | 404 |
| `DUPLICATE_DEFAULT_ADDRESS` | User already has a default address | 409 |
| `INVALID_PASSWORD` | Password doesn't meet requirements | 400 |
| `CURRENT_PASSWORD_INCORRECT` | Current password is wrong | 400 |
| `NOTIFICATION_NOT_FOUND` | Requested notification doesn't exist | 404 |
| `USERNAME_ALREADY_TAKEN` | Username is already taken | 409 |

---

## 8. Database Schema

### Users Table Extensions
```sql
ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN preferences JSON;
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### User Addresses Table
```sql
CREATE TABLE user_addresses (
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
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
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
```

---

## 9. Migration Instructions

1. **Run Database Migration:**
   ```bash
   psql -d wh40k_auction -f scripts/migration-v2.sql
   ```

2. **Update Environment Variables:**
   Ensure all required environment variables are set.

3. **Restart Application:**
   ```bash
   npm run start:dev
   ```

4. **Test Endpoints:**
   Use the provided API documentation to test all new endpoints.

---

## 10. Security Considerations

- All sensitive endpoints require JWT authentication
- Password changes require current password verification
- Users can only access their own data
- Address validation is performed on all address operations
- Rate limiting is applied to sensitive operations

---

## 11. Testing Examples

### Test User Profile Update
```bash
curl -X PUT http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### Test Address Addition
```bash
curl -X POST http://localhost:3000/api/v1/users/addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "isDefault": true
  }'
```

### Test Notifications
```bash
curl -X GET http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
