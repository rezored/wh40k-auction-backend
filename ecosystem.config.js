module.exports = {
    apps: [
        {
            name: 'wh40k-auction-backend',
            script: 'dist/main.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                DATABASE_URL: process.env.DATABASE_URL || 'postgres://wh40k_user:wh40k_password@localhost:5432/wh40k_auction'
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
                DATABASE_URL: process.env.DATABASE_URL
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: 3000,
                DATABASE_URL: process.env.DATABASE_URL || 'postgres://wh40k_user:wh40k_password@localhost:5432/wh40k_auction'
            },
            // Logging
            log_file: './logs/combined.log',
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

            // Restart policy
            max_memory_restart: '1G',
            min_uptime: '10s',
            max_restarts: 10,

            // Watch for changes (useful for development)
            watch: false,
            ignore_watch: ['node_modules', 'logs', 'dist'],

            // Environment variables
            env_file: '.env',

            // Graceful shutdown
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,

            // Health check
            health_check_grace_period: 3000,

            // Cron restart (optional - restart every day at 2 AM)
            cron_restart: '0 2 * * *'
        }
    ],

    deploy: {
        production: {
            user: 'deploy',
            host: 'your-server-ip',
            ref: 'origin/main',
            repo: 'git@github.com:your-username/wh40k-auction-backend.git',
            path: '/var/www/wh40k-auction-backend',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
};
