import { Controller, Get, Post, Body, Param, Delete, Put, Request, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('listings')
export class ListingsController {
    constructor(private service: ListingsService) { }

    @Get()
    getAll() {
        return this.service.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() body, @Request() req) {
        if (!body) {
            throw new Error('Request body is required');
        }
        return this.service.create(body, req.user);
    }

    @Get(':id')
    getOne(@Param('id') id: number) {
        return this.service.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: number, @Body() body) {
        return this.service.update(id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.service.remove(id);
    }
}
