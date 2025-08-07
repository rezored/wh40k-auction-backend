import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    Query,
    ParseIntPipe
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import type { UpdateAuctionRequest } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Auction, AuctionStatus, AuctionCategory, AuctionCondition } from './auctions.entity';
import { Bid } from '../bids/bids.entity';
import { BidsService } from '../bids/bids.service';
import { OffersService } from '../offers/offers.service';

@Controller('auctions')
export class AuctionsController {
    constructor(
        private auctionsService: AuctionsService,
        private bidsService: BidsService,
        private offersService: OffersService
    ) { }

    @Get()
    async getAllAuctions(
        @Query('status') status?: AuctionStatus,
        @Query('category') category?: AuctionCategory,
        @Query('condition') condition?: AuctionCondition,
        @Query('search') search?: string
    ): Promise<Auction[]> {
        if (status === AuctionStatus.ACTIVE) {
            return this.auctionsService.findActiveAuctions();
        }

        return this.auctionsService.findAll();
    }

    @Get('active')
    async getActiveAuctions(): Promise<Auction[]> {
        return this.auctionsService.findActiveAuctions();
    }

    @Get('categories')
    getCategories(): AuctionCategory[] {
        return Object.values(AuctionCategory);
    }

    @Get('conditions')
    getConditions(): AuctionCondition[] {
        return Object.values(AuctionCondition);
    }

    @Get('statuses')
    getStatuses(): AuctionStatus[] {
        return Object.values(AuctionStatus);
    }

    @Get(':id')
    async getAuctionById(@Param('id', ParseIntPipe) id: number): Promise<Auction> {
        return this.auctionsService.findById(id);
    }

    @Get(':id/bids')
    async getAuctionBids(@Param('id', ParseIntPipe) id: number): Promise<Bid[]> {
        return this.auctionsService.getAuctionBids(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createAuction(
        @Body() createAuctionDto: CreateAuctionDto,
        @Request() req
    ): Promise<Auction> {
        const createAuctionRequest = {
            ...createAuctionDto,
            endTime: createAuctionDto.endTime ? new Date(createAuctionDto.endTime) : undefined
        };
        return this.auctionsService.createAuction(createAuctionRequest, req.user);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateAuction(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAuctionDto: UpdateAuctionRequest,
        @Request() req
    ): Promise<Auction> {
        return this.auctionsService.updateAuction(id, updateAuctionDto, req.user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteAuction(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ): Promise<{ message: string }> {
        await this.auctionsService.deleteAuction(id, req.user);
        return { message: 'Auction deleted successfully' };
    }

    @Post(':id/end')
    @UseGuards(JwtAuthGuard)
    async endAuction(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ): Promise<Auction> {
        return this.auctionsService.endAuction(id, req.user);
    }

    @Post(':id/cancel')
    @UseGuards(JwtAuthGuard)
    async cancelAuction(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ): Promise<Auction> {
        return this.auctionsService.cancelAuction(id, req.user);
    }

    @Post(':id/offers')
    @UseGuards(JwtAuthGuard)
    async createOfferOnAuction(
        @Param('id', ParseIntPipe) auctionId: number,
        @Body() body: { amount: number; message?: string },
        @Request() req
    ) {
        return this.offersService.createOffer(
            auctionId,
            req.user,
            body.amount,
            body.message
        );
    }

    @Post(':id/bids')
    @UseGuards(JwtAuthGuard)
    async placeBidOnAuction(
        @Param('id', ParseIntPipe) auctionId: number,
        @Body() body: { amount: number },
        @Request() req
    ): Promise<Bid> {
        console.log('🎯 Auctions Controller - placeBidOnAuction called');
        console.log('🎯 Auctions Controller - auctionId:', auctionId);
        console.log('🎯 Auctions Controller - body:', body);
        console.log('🎯 Auctions Controller - user:', req.user);
        
        return this.bidsService.placeBid(body.amount, req.user, auctionId);
    }
} 