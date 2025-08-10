# Enhanced Auction Creation API Documentation

## Overview
This document describes the enhanced auction creation functionality with multi-image support, improved validation, and better auction management features.

## API Endpoints

### 1. Enhanced Auction Creation
**POST** `/api/v1/auctions/enhanced`

Creates a new auction with multiple images and enhanced validation.

#### Request Body
```json
{
  "title": "Space Marine Terminator Squad",
  "description": "Excellent condition Space Marine Terminator Squad, fully painted",
  "startingPrice": 45.00,
  "reservePrice": 60.00,
  "category": "miniatures",
  "condition": "excellent",
  "endTime": "2025-12-31T23:59:59Z",
  "saleType": "auction",
  "minOffer": 50.00,
  "offerExpiryDays": 7,
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "thumbnailUrl": "https://example.com/thumb1.jpg",
      "filename": "image1.jpg",
      "originalFilename": "terminator_squad.jpg",
      "fileSize": 2048576,
      "mimeType": "image/jpeg",
      "width": 1200,
      "height": 800,
      "altText": "Space Marine Terminator Squad front view"
    }
  ]
}
```

#### Response
```json
{
  "id": 1,
  "title": "Space Marine Terminator Squad",
  "description": "Excellent condition Space Marine Terminator Squad, fully painted",
  "startingPrice": "45.00",
  "currentPrice": "45.00",
  "reservePrice": "60.00",
  "category": "miniatures",
  "condition": "excellent",
  "status": "active",
  "createdAt": "2025-08-08T22:00:00.000Z",
  "endTime": "2025-12-31T23:59:59Z",
  "owner": {
    "id": 1,
    "username": "user123"
  },
  "images": [
    {
      "id": 1,
      "filename": "image1.jpg",
      "url": "https://example.com/image1.jpg",
      "thumbnailUrl": "https://example.com/thumb1.jpg",
      "isMain": true,
      "order": 0,
      "status": "active"
    }
  ]
}
```

### 2. Image Upload
**POST** `/api/v1/auctions/images/upload`

Handles image file uploads before auction creation.

#### Request
- **Content-Type**: `multipart/form-data`
- **Files**: `images` (array of image files)
- **Authentication**: Required (JWT)

#### File Requirements
- **Maximum size**: 10MB per file
- **Supported formats**: JPG, JPEG, PNG, WebP
- **Maximum files**: 10 per request

#### Response
```json
{
  "message": "Images uploaded successfully",
  "count": 2,
  "uploadId": "1733692800000",
  "images": [
    {
      "filename": "1733692800000_abc123.jpg",
      "originalFilename": "terminator1.jpg",
      "url": "http://localhost:3000/uploads/auctions/1733692800000_abc123.jpg",
      "thumbnailUrl": "http://localhost:3000/uploads/auctions/thumbnails/thumb_1733692800000_abc123.jpg",
      "fileSize": 2048576,
      "mimeType": "image/jpeg",
      "width": 1200,
      "height": 800,
      "isMain": true
    }
  ]
}
```

### 3. Set Main Image
**PUT** `/api/v1/auctions/{auctionId}/images/{imageId}/main`

Sets the main image for an auction.

#### Response
```json
{
  "message": "Main image updated successfully",
  "image": {
    "id": 2,
    "filename": "image2.jpg",
    "isMain": true,
    "order": 1
  }
}
```

### 4. Delete Image
**DELETE** `/api/v1/auctions/{auctionId}/images/{imageId}`

Removes an image from an auction (soft delete).

#### Response
```json
{
  "message": "Image deleted successfully"
}
```

### 5. Reorder Images
**PUT** `/api/v1/auctions/{auctionId}/images/reorder`

Reorders images for display.

#### Request Body
```json
{
  "message": "Reorder images",
  "images": [
    {
      "imageId": 1,
      "newOrder": 2
    },
    {
      "imageId": 2,
      "newOrder": 0
    }
  ]
}
```

#### Response
```json
{
  "message": "Images reordered successfully"
}
```

### 6. Get Auction Images
**GET** `/api/v1/auctions/{auctionId}/images`

Retrieves all images for a specific auction.

#### Response
```json
{
  "images": [
    {
      "id": 1,
      "filename": "image1.jpg",
      "url": "http://localhost:3000/uploads/auctions/image1.jpg",
      "thumbnailUrl": "http://localhost:3000/uploads/auctions/thumbnails/thumb_image1.jpg",
      "isMain": true,
      "order": 0,
      "status": "active"
    }
  ]
}
```

## Data Models

### AuctionImage Entity
```typescript
export class AuctionImage {
  id: number;
  auctionId: number;
  filename: string;
  originalFilename: string;
  url: string;
  thumbnailUrl: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  isMain: boolean;
  order: number;
  status: ImageStatus;
  altText?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ImageStatus Enum
```typescript
export enum ImageStatus {
  ACTIVE = 'active',
  DELETED = 'deleted'
}
```

## Business Rules

### Image Validation
- **File size limit**: 10MB per image
- **Supported formats**: JPG, JPEG, PNG, WebP
- **Maximum images per auction**: 10
- **Minimum images required**: 1

### Image Management
- **Main image**: Only one main image per auction
- **Automatic main image**: First uploaded image becomes main by default
- **Soft delete**: Images are marked as deleted but not physically removed
- **Ordering**: Images can be reordered for display purposes

### Security
- **Authentication required**: All image management operations require JWT
- **Ownership verification**: Users can only modify their own auction images
- **File validation**: Server-side validation of file types and sizes

## Error Handling

### Common Error Responses

#### File Too Large
```json
{
  "statusCode": 400,
  "message": "File image1.jpg is too large. Maximum size is 10MB.",
  "error": "Bad Request"
}
```

#### Invalid File Type
```json
{
  "statusCode": 400,
  "message": "File type image/gif is not supported. Allowed types: JPG, PNG, WebP.",
  "error": "Bad Request"
}
```

#### Too Many Images
```json
{
  "statusCode": 400,
  "message": "Maximum 10 images allowed",
  "error": "Bad Request"
}
```

#### Unauthorized
```json
{
  "statusCode": 403,
  "message": "You can only modify your own auctions",
  "error": "Forbidden"
}
```

## File Storage

### Local Storage Structure
```
uploads/
└── auctions/
    ├── image1.jpg
    ├── image2.png
    └── thumbnails/
        ├── thumb_image1.jpg
        └── thumb_image2.png
```

### Static File Serving
- **URL prefix**: `/uploads/`
- **Base path**: `uploads/` (relative to project root)
- **Thumbnail prefix**: `thumb_`

## Migration Notes

### Database Changes
1. New table: `auction_images`
2. New enum: `image_status`
3. Indexes for performance optimization
4. Foreign key constraints with cascade delete

### Backward Compatibility
- Legacy `imageUrl` field remains supported
- Existing auctions continue to work
- Gradual migration to new image system

## Performance Considerations

### Database Indexes
- `auction_id` for fast lookups
- `auction_id + is_main` for main image queries
- `auction_id + order` for ordered image retrieval
- `status` for active image filtering

### File Handling
- Thumbnail generation for faster loading
- Soft delete to maintain referential integrity
- Efficient file storage with unique naming

## Future Enhancements

### Planned Features
- **Image optimization**: Automatic resizing and compression
- **Cloud storage**: Integration with AWS S3, Google Cloud Storage
- **CDN support**: Global image delivery
- **Image processing**: Watermarking, format conversion
- **Bulk operations**: Batch image upload and management

### Scalability
- **Image caching**: Redis-based image caching
- **Async processing**: Background image optimization
- **Storage tiers**: Hot/cold storage for different image types
