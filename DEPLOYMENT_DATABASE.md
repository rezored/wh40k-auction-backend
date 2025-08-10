# Database Deployment Guide for WH40K Auction Backend

This guide will help you resolve the database connectivity issues and get your application running properly.

## Current Issue
The application is failing to connect to the database because the required tables (`auction`, `user`, etc.) don't exist. TypeORM's `synchronize: true` is not working properly, likely due to PostgreSQL service instability or corrupted database state.

## Prerequisites
- Access to your server via SSH
- PostgreSQL installed and configured
- PM2 installed
- Node.js and npm installed

## Quick Fix (Recommended)

### Option 1: Use the Automated Script (Linux/Mac)
```bash
# Make the script executable
chmod +x scripts/deploy-database.sh

# Run the deployment script
./scripts/deploy-database.sh
```

### Option 2: Use the Windows Batch File
```cmd
# Run the deployment script
scripts\deploy-database.bat
```

### Option 3: Manual Step-by-Step (if scripts don't work)

#### Step 1: Stop the Application
```bash
# Stop PM2 process
pm2 stop wh40k-auction-backend
pm2 delete wh40k-auction-backend
```

#### Step 2: Ensure PostgreSQL is Running
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify it's running
sudo systemctl is-active postgresql
```

#### Step 3: Test Database Connection
```bash
# Test connection with your credentials
PGPASSWORD='your_actual_password' psql -h 127.0.0.1 -U wh40k_user -d wh40k_auction -c "SELECT 1;"
```

#### Step 4: Recreate Database (WARNING: This deletes all data!)
```bash
# Connect to postgres database to drop/recreate
PGPASSWORD='your_actual_password' psql -h 127.0.0.1 -U wh40k_user -d postgres -c "DROP DATABASE IF EXISTS wh40k_auction;"
PGPASSWORD='your_actual_password' psql -h 127.0.0.1 -U wh40k_user -d postgres -c "CREATE DATABASE wh40k_auction OWNER wh40k_user;"
```

#### Step 5: Run Database Setup Script
```bash
# Run the comprehensive setup script
PGPASSWORD='your_actual_password' psql -h 127.0.0.1 -U wh40k_user -d wh40k_auction -f scripts/setup-database.sql
```

#### Step 6: Verify Tables Were Created
```bash
# Check what tables exist
PGPASSWORD='your_actual_password' psql -h 127.0.0.1 -U wh40k_user -d wh40k_auction -c "\dt"
```

#### Step 7: Build and Start Application
```bash
# Build the project
npm run build

# Start PM2 process
pm2 start ecosystem.config.js --env production

# Check status
pm2 list

# Check logs
pm2 logs wh40k-auction-backend --lines 20
```

## What the Setup Script Creates

The `scripts/setup-database.sql` script creates:

1. **`user` table** - User accounts and authentication
2. **`auctions` table** - Auction listings with metadata
3. **`auction_images` table** - Multiple images per auction (new feature)
4. **`bids` table** - Bids placed on auctions
5. **`offers` table** - Direct offers on auctions
6. **Proper indexes** for performance
7. **Foreign key constraints** for data integrity
8. **Enums** for status fields

## Troubleshooting

### PostgreSQL Service Issues
If PostgreSQL keeps stopping:
```bash
# Check detailed logs
sudo journalctl -u postgresql -n 50

# Check configuration
sudo -u postgres psql -c "SHOW config_file;"
```

### Permission Issues
```bash
# Ensure proper permissions
sudo chown -R postgres:postgres /var/lib/postgresql
sudo chmod 700 /var/lib/postgresql/15/main
```

### Connection Issues
- Use `127.0.0.1` instead of `localhost` to avoid IPv6 issues
- Ensure firewall allows connections on port 5432
- Check `pg_hba.conf` for authentication settings

### Database Lock Issues
If you get "database is being accessed by other users":
```bash
# Force disconnect all users
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'wh40k_auction';"
```

## Verification

After successful deployment, you should see:

1. **PM2 Status**: All processes showing as "online"
2. **Database Tables**: 5 tables created (`user`, `auctions`, `auction_images`, `bids`, `offers`)
3. **Application Logs**: No database connection errors
4. **API Endpoints**: Accessible at `http://your-domain:3000/api/v1/`

## Next Steps

Once the database is working:

1. **Test the API endpoints** using the documentation in `ENHANCED_AUCTION_API.md`
2. **Set up your domain** by updating DNS A record in Cloudflare
3. **Configure SSL/HTTPS** for production use
4. **Monitor logs** for any issues

## Support

If you encounter issues:

1. Check the PM2 logs: `pm2 logs wh40k-auction-backend --lines 50`
2. Check PostgreSQL logs: `sudo journalctl -u postgresql -n 20`
3. Verify database connection manually
4. Ensure all environment variables are set correctly

## Environment Variables

Make sure your `.env` file contains:
```bash
DATABASE_URL=postgres://wh40k_user:your_actual_password@127.0.0.1:5432/wh40k_auction
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://your-frontend-domain.com
```

Remember to replace `your_actual_password` with the actual password you set for the `wh40k_user` database user.
