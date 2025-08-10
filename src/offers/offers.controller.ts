import {
    Controller,
    Post,
    Get,
    Put,
    Body,
    Param,
    UseGuards,
    Request,
    ParseIntPipe
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Offer } from './offers.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';

@Controller('offers')
export class OffersController {
    constructor(private offersService: OffersService) { }

    @Post('auction/:auctionId')
    @UseGuards(JwtAuthGuard)
    async createOffer(
        @Param('auctionId', ParseIntPipe) auctionId: number,
        @Body() createOfferDto: CreateOfferDto,
        @Request() req
    ): Promise<Offer> {
        return this.offersService.createOffer(
            auctionId,
            req.user,
            createOfferDto.amount,
            createOfferDto.message
        );
    }

    @Put(':offerId/respond')
    @UseGuards(JwtAuthGuard)
    async respondToOffer(
        @Param('offerId') offerId: string,
        @Body() respondOfferDto: RespondOfferDto,
        @Request() req
    ): Promise<Offer> {
        return this.offersService.respondToOffer(
            offerId,
            req.user,
            respondOfferDto.response
        );
    }

    @Get('my-offers')
    @UseGuards(JwtAuthGuard)
    async getMyOffers(@Request() req): Promise<Offer[]> {
        return this.offersService.getMyOffers(req.user.id);
    }

    @Get('received/:auctionId')
    @UseGuards(JwtAuthGuard)
    async getReceivedOffers(
        @Param('auctionId', ParseIntPipe) auctionId: number,
        @Request() req
    ): Promise<Offer[]> {
        return this.offersService.getReceivedOffers(auctionId, req.user);
    }

    @Get('auction/:auctionId')
    @UseGuards(JwtAuthGuard)
    async getAuctionOffers(
        @Param('auctionId', ParseIntPipe) auctionId: number,
        @Request() req
    ): Promise<Offer[]> {
        return this.offersService.getAuctionOffers(auctionId, req.user.id);
    }

    @Get('my-auction-offers')
    @UseGuards(JwtAuthGuard)
    async getMyAuctionOffers(@Request() req) {
        const userId = req.user.id;
        const offers = await this.offersService.getOffersForAuctionOwner(userId);

        return {
            offers: offers.map(offer => ({
                id: offer.id,
                amount: offer.amount,
                status: offer.status,
                createdAt: offer.createdAt,
                message: offer.message,
                auctionId: offer.auction.id,
                auctionTitle: offer.auction.title,
                auctionImage: offer.auction.imageUrl,
                buyerId: offer.buyer.id,
                buyerUsername: offer.buyer.username,
                buyerFirstName: offer.buyer.firstName
            }))
        };
    }

    @Get(':offerId')
    @UseGuards(JwtAuthGuard)
    async getOfferById(@Param('offerId') offerId: string): Promise<Offer> {
        return this.offersService.getOfferById(offerId);
    }

    // Enhanced Offer Endpoints
    @Post(':offerId/accept-with-address')
    @UseGuards(JwtAuthGuard)
    async acceptOfferWithAddress(
        @Param('offerId') offerId: string,
        @Body() body: { response: 'accept'; shippingAddress: any },
        @Request() req
    ): Promise<{ offer: Offer; message: string }> {
        return this.offersService.acceptOfferWithAddress(offerId, req.user, body.shippingAddress);
    }

    @Post(':offerId/notify-accepted')
    @UseGuards(JwtAuthGuard)
    async notifyOfferAccepted(
        @Param('offerId') offerId: string,
        @Body() acceptanceData: any,
        @Request() req
    ): Promise<any> {
        return this.offersService.notifyOfferAccepted(offerId, acceptanceData, req.user);
    }
}
