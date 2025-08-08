# Deployment Guide

This guide covers how to run the WH40K Auction Backend both locally for development and on a production server with PM2.

## Local Development

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Docker (optional, for database)

### Option 1: Using Docker (Recommended for local development)

1. **Start the database and backend:**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies (if not already done):**
   ```bash
   docker-compose exec backend npm install
   ```

3. **Access the API:**
   - Backend: http://localhost:3000/api/v1
   - Database: localhost:5432

### Option 2: Local PostgreSQL

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the development server:**
   ```bash
   npm run start:dev
   ```

## Production Deployment with PM2

### Prerequisites
- Node.js (v18 or higher)
- PM2 (`npm install -g pm2`)
- PostgreSQL server
- Git

### Server Setup

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd wh40k-auction-backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Build the application:**
   ```bash
   npm run build
   ```

5. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with production values
   ```

### PM2 Commands

#### Start the application:
```bash
# Start in production mode
npm run pm2:start:prod

# Start in development mode
npm run pm2:start:dev

# Start with default settings
npm run pm2:start
```

#### Manage the application:
```bash
# Stop the application
npm run pm2:stop

# Restart the application
npm run pm2:restart

# Reload the application (zero-downtime)
npm run pm2:reload

# Delete the application from PM2
npm run pm2:delete

# View logs
npm run pm2:logs

# Monitor the application
npm run pm2:monit
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgres://wh40k_user:wh40k_password@localhost:5432/wh40k_auction

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=wh40k-super-secret-jwt-key-2024-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGINS=https://your-frontend-domain.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Database Management

**Important**: Each Docker environment creates its own database instance. This means:
- Data created on your laptop won't appear on your home computer
- Each environment starts with a fresh database
- You need to migrate data manually between environments

#### Data Migration Options:

1. **Use the migration script** (recommended):
   ```bash
   # On Linux/Mac
   ./scripts/db-migrate.sh
   
   # On Windows
   scripts\db-migrate.bat
   ```

2. **Manual backup/restore**:I 
   ```bash
   # Export from laptop
   pg_dump -h localhost -p 5432 -U wh40k_user -d wh40k_auction > backup.sql
   
   # Import to home computer
   psql -h localhost -p 5432 -U wh40k_user -d wh40k_auction < backup.sql
   ```

3. **Create test data**:
   ```bash
   # Use the migration script option 3 to create test users and auctions
   ./scripts/db-migrate.sh
   ```

### PM2 Ecosystem Configuration

The `ecosystem.config.js` file is configured for:
- **Cluster mode**: Runs multiple instances for better performance
- **Auto-restart**: Restarts on crashes or memory limits
- **Logging**: Separate log files for output and errors
- **Health checks**: Monitors application health
- **Graceful shutdown**: Proper cleanup on restarts

### Deployment Scripts

For automated deployment, update the `ecosystem.config.js` file with your server details:

```javascript
deploy: {
  production: {
    user: 'deploy',
    host: 'your-server-ip',
    ref: 'origin/main',
    repo: 'git@github.com:your-username/wh40k-auction-backend.git',
    path: '/var/www/wh40k-auction-backend',
    'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
  }
}
```

Then use:
```bash
# Initial setup
npm run deploy:setup

# Deploy updates
npm run deploy

# Revert to previous version
npm run deploy:revert
```

### Monitoring and Logs

- **PM2 Dashboard**: `pm2 monit`
- **Application Logs**: `pm2 logs wh40k-auction-backend`
- **Error Logs**: Check `./logs/error.log`
- **Combined Logs**: Check `./logs/combined.log`

### Performance Optimization

The PM2 configuration includes:
- **Cluster mode**: Utilizes all CPU cores
- **Memory limit**: Restarts if memory exceeds 1GB
- **Health checks**: Monitors application responsiveness
- **Graceful shutdown**: Proper cleanup on restarts

### Troubleshooting

1. **Application won't start:**
   - Check logs: `pm2 logs`
   - Verify environment variables
   - Ensure database is accessible

2. **Memory issues:**
   - Monitor with: `pm2 monit`
   - Adjust `max_memory_restart` in ecosystem.config.js

3. **Database connection issues:**
   - Verify DATABASE_URL in .env
   - Check PostgreSQL server status
   - Ensure network connectivity

4. **Port conflicts:**
   - Change PORT in .env
   - Update ecosystem.config.js accordingly

### Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, unique secret
3. **Database**: Use strong passwords and limit access
4. **CORS**: Configure allowed origins properly
5. **Rate Limiting**: Adjust limits based on your needs
