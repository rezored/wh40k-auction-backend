import { Controller, Get, Post, Put, Delete, All, Req, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('routes')
  getRoutes() {
    return {
      message: 'Available API Routes',
      version: 'v1',
      baseUrl: '/api/v1',
      routes: {
        health: {
          'GET /': 'Application health check'
        },
        auth: {
          'POST /auth/register': 'Register a new user',
          'POST /auth/login': 'Login user'
        },
        listings: {
          'GET /listings': 'Get all listings',
          'POST /listings': 'Create a new listing (requires auth)',
          'GET /listings/:id': 'Get a specific listing',
          'PUT /listings/:id': 'Update a listing (requires auth)',
          'DELETE /listings/:id': 'Delete a listing (requires auth)'
        },
        bids: {
          'POST /bids': 'Place a bid (requires auth)'
        }
      }
    };
  }
}
