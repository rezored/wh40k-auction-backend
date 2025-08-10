import { Controller, Post, Get, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { BidsService } from './bids.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Bid } from './bids.entity';

@Controller('api/v1/bids')
export class BidsController {
    constructor(private bidsService: BidsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async placeBid(
        @Body() placeBidDto: PlaceBidDto,
        @Request() req
    ): Promise<Bid> {
        return this.bidsService.placeBid(placeBidDto.amount, req.user, placeBidDto.auctionId);
    }

    @Get('auction/:auctionId')
    async getBidsByAuction(@Param('auctionId', ParseIntPipe) auctionId: number): Promise<Bid[]> {
        return this.bidsService.getBidsByAuction(auctionId);
    }

    @Get('my-bids')
    @UseGuards(JwtAuthGuard)
    async getMyBids(@Request() req): Promise<Bid[]> {
        try {
            console.log('🎯 Bids Controller - getMyBids called');
            console.log('🎯 Bids Controller - User ID:', req.user.id);
            console.log('🎯 Bids Controller - User:', req.user);

            const bids = await this.bidsService.getBidsByUser(req.user.id);
            console.log('🎯 Bids Controller - Found bids:', bids.length);
            return bids;
        } catch (error) {
            console.error('❌ Bids Controller - Error in getMyBids:', error);
            throw error;
        }
    }

    @Get('auction/:auctionId/winning')
    async getWinningBid(@Param('auctionId', ParseIntPipe) auctionId: number): Promise<Bid | null> {
        return this.bidsService.getWinningBid(auctionId);
    }

    @Get(':id')
    async getBidById(@Param('id', ParseIntPipe) id: number): Promise<Bid> {
        return this.bidsService.getBidById(id);
    }
}
