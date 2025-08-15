# API Style Guide

## API Versioning

### Versioning Strategy
- All API routes use the prefix `/api/v1`
- This follows REST API best practices for versioning
- Future versions will use `/api/v2`, `/api/v3`, etc.

### Current API Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user

#### Users (`/api/v1/user`)
- User management endpoints (to be implemented)

#### Listings (`/api/v1/listings`)
- `GET /api/v1/listings` - Get all listings
- `POST /api/v1/listings` - Create a new listing (requires auth)
- `GET /api/v1/listings/:id` - Get a specific listing
- `PUT /api/v1/listings/:id` - Update a listing (requires auth)
- `DELETE /api/v1/listings/:id` - Delete a listing (requires auth)

#### Bids (`/api/v1/bids`)
- `POST /api/v1/bids` - Place a bid (requires auth)

#### Health Check (`/api/v1/`)
- `GET /api/v1/` - Application health check

## Best Practices

### 1. API Versioning
- Always use versioned endpoints: `/api/v1/...`
- Never break backward compatibility within the same version
- Use new versions for breaking changes

### 2. HTTP Methods
- `GET` - Retrieve data
- `POST` - Create new resources
- `PUT` - Update existing resources (full update)
- `PATCH` - Partial updates (when implemented)
- `DELETE` - Remove resources

### 3. Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### 4. Authentication
- Use JWT tokens for authentication
- Include `Authorization: Bearer <token>` header for protected routes
- All sensitive operations require authentication

### 5. Error Handling
- Return consistent error responses
- Include meaningful error messages
- Use appropriate HTTP status codes

### 6. Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### 7. Pagination (when implemented)
- Use `page` and `limit` query parameters
- Return pagination metadata in responses

### 8. Filtering and Sorting (when implemented)
- Use query parameters for filtering
- Use `sort` parameter for sorting
- Use `search` parameter for text search

## Development Guidelines

### Adding New Endpoints
1. Create the controller with appropriate route prefix
2. Add proper validation using DTOs
3. Implement proper error handling
4. Add authentication guards where needed
5. Write tests for the new endpoints
6. Update this style guide

### Database Conventions
- Use snake_case for database column names
- Use camelCase for JavaScript/TypeScript properties
- Include timestamps (created_at, updated_at) for all entities

### Code Organization
- Keep controllers thin - delegate business logic to services
- Use DTOs for request/response validation
- Implement proper separation of concerns
- Write comprehensive tests

## Security Guidelines

### Authentication
- All sensitive endpoints require JWT authentication
- Tokens should have appropriate expiration times
- Implement refresh token mechanism (when needed)

### Input Validation
- Validate all input data
- Sanitize user inputs
- Use DTOs for type safety

### Error Messages
- Don't expose sensitive information in error messages
- Log detailed errors for debugging
- Return generic messages to clients

## Testing Guidelines

### Unit Tests
- Test all service methods
- Mock external dependencies
- Achieve high code coverage

### Integration Tests
- Test API endpoints
- Test database interactions
- Test authentication flows

### E2E Tests
- Test complete user workflows
- Test error scenarios
- Test performance under load

## Documentation

### API Documentation
- Use OpenAPI/Swagger for API documentation
- Keep documentation up to date
- Include examples for all endpoints

### Code Documentation
- Document complex business logic
- Use JSDoc for public methods
- Keep README files updated

## Performance Guidelines

### Database
- Use proper indexing
- Optimize queries
- Use connection pooling

### Caching
- Implement caching for frequently accessed data
- Use Redis for session storage (when implemented)
- Cache static content

### Monitoring
- Log important events
- Monitor API response times
- Set up alerts for errors

## Deployment Guidelines

### Environment Variables
- Use environment variables for configuration
- Never commit sensitive data
- Use different configs for different environments

### Docker
- Use multi-stage builds
- Optimize image size
- Use health checks

### CI/CD
- Automate testing
- Automate deployment
- Use blue-green deployment (when implemented) 