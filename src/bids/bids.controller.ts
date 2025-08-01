import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('bids')
export class BidsController {
    constructor(private service: BidsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    placeBid(@Body() body, @Request() req) {
        return this.service.placeBid(body.amount, req.user, body.listingId);
    }
}
