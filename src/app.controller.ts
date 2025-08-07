import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };
  }

  @Get('status')
  getServerStatus() {
    return {
      server: 'WH40K Auction Backend',
      status: 'running',
      port: process.env.PORT || 3000,
      database: 'connected',
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      uptime: `${Math.floor(process.uptime())} seconds`
    };
  }

  @Get('routes')
  getRoutes() {
    return {
      message: 'Available API Routes',
      version: 'v1',
      baseUrl: '/api/v1',
      routes: {
        health: {
          'GET /': 'Application health check',
          'GET /health': 'Detailed health status',
          'GET /status': 'Server status information'
        },
        auth: {
          'POST /auth/register': 'Register a new user',
          'POST /auth/login': 'Login user'
        },
        auctions: {
          'GET /auctions': 'Get all auctions',
          'GET /auctions/active': 'Get active auctions',
          'POST /auctions': 'Create a new auction (requires auth)',
          'GET /auctions/:id': 'Get a specific auction',
          'PUT /auctions/:id': 'Update an auction (requires auth)',
          'DELETE /auctions/:id': 'Delete an auction (requires auth)',
          'POST /auctions/:id/end': 'End an auction (requires auth)',
          'POST /auctions/:id/cancel': 'Cancel an auction (requires auth)',
          'GET /auctions/:id/bids': 'Get auction bids',
          'GET /auctions/categories': 'Get auction categories',
          'GET /auctions/conditions': 'Get auction conditions',
          'GET /auctions/statuses': 'Get auction statuses'
        },
        bids: {
          'POST /bids': 'Place a bid (requires auth)',
          'GET /bids/auction/:auctionId': 'Get bids for an auction',
          'GET /bids/user': 'Get user bids (requires auth)',
          'GET /bids/auction/:auctionId/winning': 'Get winning bid for auction',
          'GET /bids/:id': 'Get specific bid'
        }
      }
    };
  }
}
