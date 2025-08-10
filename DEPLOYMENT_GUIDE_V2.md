# WH40K Auction System - Deployment Guide v2

## Important: Database Migration vs Synchronize

### ❌ Why NOT to use `synchronize: true` in Production

The `synchronize: true` setting in TypeORM is **dangerous for production** because:

1. **Data Loss Risk**: It can drop columns, tables, or entire databases
2. **Unpredictable Changes**: Schema modifications are automatic and uncontrolled
3. **No Rollback**: Changes are irreversible
4. **Downtime**: Can cause application crashes during schema updates
5. **Security Issues**: May expose sensitive data or create vulnerabilities

### ✅ Correct Approach: Manual Database Migration

We've implemented the proper approach:

1. **Migration Script**: `scripts/migration-v2.sql` contains all necessary schema changes
2. **Production-Safe Config**: `synchronize` is now only enabled in development
3. **Controlled Updates**: You control exactly what changes are applied

## Debian Deployment Steps

### 1. Upload Files
Upload all project files to your Debian server.

### 2. Set Environment Variables
```bash
# Copy the production environment template
cp env.production .env

# Edit the .env file with your actual values
nano .env
```

### 3. Run the Deployment Script
```bash
# Make the script executable
chmod +x scripts/deploy-v2.sh

# Run the deployment
./scripts/deploy-v2.sh
```

### 4. Manual Database Migration (if needed)
If the deployment script can't run the migration automatically:

```bash
# Connect to your PostgreSQL database
psql -U wh40k_user -d wh40k_auction -f scripts/migration-v2.sql
```

## What the Migration Script Does

The `scripts/migration-v2.sql` script safely adds:

1. **User Profile Fields**: `first_name`, `last_name`, `phone`, `preferences`
2. **User Addresses Table**: Complete address management system
3. **Notifications Table**: Full notification system
4. **Indexes**: Performance optimizations
5. **Triggers**: Automatic timestamp updates
6. **Views**: Convenient data access patterns

## Verification Steps

After deployment, verify everything works:

```bash
# Check if the application is running
curl http://localhost:3000/api/v1/auth/health

# Check database tables
psql -U wh40k_user -d wh40k_auction -c "\dt"

# Check new tables exist
psql -U wh40k_user -d wh40k_auction -c "SELECT * FROM user_addresses LIMIT 1;"
psql -U wh40k_user -d wh40k_auction -c "SELECT * FROM notifications LIMIT 1;"
```

## Troubleshooting

### Migration Fails
If the migration script fails:

1. **Check PostgreSQL Connection**:
   ```bash
   psql -U wh40k_user -d wh40k_auction -c "SELECT version();"
   ```

2. **Check Permissions**:
   ```bash
   # Ensure your user has CREATE privileges
   psql -U wh40k_user -d wh40k_auction -c "SELECT current_user, current_database();"
   ```

3. **Manual Migration**:
   ```bash
   # Run migration manually with verbose output
   psql -U wh40k_user -d wh40k_auction -v ON_ERROR_STOP=1 -f scripts/migration-v2.sql
   ```

### Application Won't Start
1. **Check Logs**:
   ```bash
   pm2 logs wh40k-auction-backend
   ```

2. **Check Environment**:
   ```bash
   echo $NODE_ENV
   echo $DATABASE_URL
   ```

3. **Test Database Connection**:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```

## Security Notes

1. **Change Default Passwords**: Update the JWT_SECRET and database passwords
2. **Firewall**: Ensure only necessary ports are open
3. **SSL**: Use HTTPS in production
4. **Backup**: Regularly backup your database

## Rollback Plan

If you need to rollback:

1. **Database Rollback**:
   ```sql
   -- Drop new tables (WARNING: This will lose data)
   DROP TABLE IF EXISTS notifications CASCADE;
   DROP TABLE IF EXISTS user_addresses CASCADE;
   
   -- Remove new columns from users table
   ALTER TABLE users DROP COLUMN IF EXISTS first_name;
   ALTER TABLE users DROP COLUMN IF EXISTS last_name;
   ALTER TABLE users DROP COLUMN IF EXISTS phone;
   ALTER TABLE users DROP COLUMN IF EXISTS preferences;
   ALTER TABLE users DROP COLUMN IF EXISTS created_at;
   ALTER TABLE users DROP COLUMN IF EXISTS updated_at;
   ```

2. **Application Rollback**: Deploy the previous version of your application

## Support

If you encounter issues:

1. Check the logs: `pm2 logs wh40k-auction-backend`
2. Verify database connectivity
3. Ensure all environment variables are set correctly
4. Check file permissions on the server

---

**Remember**: The migration script is the safe, controlled way to update your database schema. Never use `synchronize: true` in production!
