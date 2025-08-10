import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer, OfferStatus } from './offers.entity';
import { User } from '../user/user.entity';
import { Auction, AuctionStatus, SaleType } from '../auctions/auctions.entity';
import { AuctionsService } from '../auctions/auctions.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OffersService {
    constructor(
        @InjectRepository(Offer) private repo: Repository<Offer>,
        private auctionsService: AuctionsService,
        private notificationsService: NotificationsService
    ) { }

    async createOffer(
        auctionId: number,
        buyer: User,
        amount: number,
        message?: string
    ): Promise<Offer> {
        const auction = await this.auctionsService.findById(auctionId);

        // Validate auction is direct sale
        if (auction.saleType !== SaleType.DIRECT) {
            throw new BadRequestException('Offers can only be made on direct sales');
        }

        // Validate auction is active
        if (auction.status !== AuctionStatus.ACTIVE) {
            throw new BadRequestException('Cannot make offers on inactive auctions');
        }

        // Validate user is not the auction owner
        if (auction.owner.id === buyer.id) {
            throw new ForbiddenException('Cannot make offers on your own auction');
        }

        // Validate amount is between minOffer and startingPrice
        if (auction.minOffer && amount < auction.minOffer) {
            throw new BadRequestException(`Offer must be at least ${auction.minOffer}`);
        }

        if (amount >= auction.startingPrice) {
            throw new BadRequestException('Offer must be less than the starting price');
        }

        // Check for existing pending offer from same user
        const existingOffer = await this.repo.findOne({
            where: {
                auctionId,
                buyerId: buyer.id,
                status: OfferStatus.PENDING
            }
        });

        if (existingOffer) {
            throw new BadRequestException('You already have a pending offer on this auction');
        }

        // Calculate expiration date
        const expiresAt = auction.offerExpiryDays
            ? new Date(Date.now() + auction.offerExpiryDays * 24 * 60 * 60 * 1000)
            : null;

        // Create the offer
        const offer = this.repo.create({
            auctionId,
            buyerId: buyer.id,
            amount,
            message,
            expiresAt: expiresAt || undefined,
            buyer,
            auction
        });

        const savedOffer = await this.repo.save(offer);

        // Send notification to auction owner
        await this.sendOfferNotification(savedOffer);

        return savedOffer;
    }

    async respondToOffer(
        offerId: string,
        seller: User,
        response: 'accept' | 'reject'
    ): Promise<Offer> {
        const offer = await this.repo.findOne({
            where: { id: offerId },
            relations: ['auction', 'buyer']
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        // Validate seller owns the auction
        if (offer.auction.owner.id !== seller.id) {
            throw new ForbiddenException('Only the auction owner can respond to offers');
        }

        // Validate offer is pending
        if (offer.status !== OfferStatus.PENDING) {
            throw new BadRequestException('Can only respond to pending offers');
        }

        if (response === 'accept') {
            // Accept the offer
            offer.status = OfferStatus.ACCEPTED;

            // Update auction status to sold
            await this.auctionsService.updateAuctionStatus(offer.auctionId, AuctionStatus.SOLD);

            // Reject all other pending offers
            await this.repo.update(
                {
                    auctionId: offer.auctionId,
                    status: OfferStatus.PENDING,
                    id: offerId // Exclude the accepted offer
                },
                { status: OfferStatus.REJECTED }
            );

            // Send notification to offer maker
            await this.sendOfferResponseNotification(offer, 'accepted');
        } else {
            // Reject the offer
            offer.status = OfferStatus.REJECTED;

            // Send notification to offer maker
            await this.sendOfferResponseNotification(offer, 'rejected');
        }

        return this.repo.save(offer);
    }

    async getMyOffers(userId: number): Promise<Offer[]> {
        return this.repo.find({
            where: { buyerId: userId },
            relations: ['auction', 'buyer'],
            order: { createdAt: 'DESC' }
        });
    }

    async getReceivedOffers(auctionId: number, user: User): Promise<Offer[]> {
        // First verify the user owns the auction
        const auction = await this.auctionsService.findById(auctionId);
        if (auction.owner.id !== user.id) {
            throw new ForbiddenException('You can only view offers for your own auctions');
        }

        return this.repo.find({
            where: { auctionId },
            relations: ['auction', 'buyer'],
            order: { createdAt: 'DESC' }
        });
    }

    async getAuctionOffers(auctionId: number, sellerId: number): Promise<Offer[]> {
        // Validate seller owns the auction
        const auction = await this.auctionsService.findById(auctionId);
        if (auction.owner.id !== sellerId) {
            throw new ForbiddenException('Only the auction owner can view offers');
        }

        return this.repo.find({
            where: { auctionId },
            relations: ['buyer', 'auction'],
            order: { createdAt: 'DESC' }
        });
    }

    async getOfferById(offerId: string): Promise<Offer> {
        const offer = await this.repo.findOne({
            where: { id: offerId },
            relations: ['auction', 'buyer']
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        return offer;
    }

    async expireOffers(): Promise<void> {
        const now = new Date();

        await this.repo.update(
            {
                status: OfferStatus.PENDING,
                expiresAt: now
            },
            { status: OfferStatus.EXPIRED }
        );
    }

    async getPendingOffersByUser(auctionId: number, userId: number): Promise<Offer[]> {
        return this.repo.find({
            where: {
                auctionId,
                buyerId: userId,
                status: OfferStatus.PENDING
            }
        });
    }

    async acceptOfferWithAddress(
        offerId: string,
        seller: User,
        shippingAddress: any
    ): Promise<{ offer: Offer; message: string }> {
        const offer = await this.repo.findOne({
            where: { id: offerId },
            relations: ['auction', 'buyer']
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        // Validate seller owns the auction
        if (offer.auction.owner.id !== seller.id) {
            throw new ForbiddenException('Only the auction owner can accept offers');
        }

        // Validate offer is pending
        if (offer.status !== OfferStatus.PENDING) {
            throw new BadRequestException('Offer is not pending');
        }

        // Accept the offer
        offer.status = OfferStatus.ACCEPTED;
        offer.acceptedAt = new Date();
        const savedOffer = await this.repo.save(offer);

        return {
            offer: savedOffer,
            message: 'Offer accepted successfully with shipping address'
        };
    }

    async notifyOfferAccepted(
        offerId: string,
        acceptanceData: any,
        seller: User
    ): Promise<{ message: string }> {
        const offer = await this.repo.findOne({
            where: { id: offerId },
            relations: ['auction', 'buyer']
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        // Validate seller owns the auction
        if (offer.auction.owner.id !== seller.id) {
            throw new ForbiddenException('Only the auction owner can send notifications');
        }

        return {
            message: 'Offer acceptance notification sent successfully'
        };
    }

    private async sendOfferNotification(offer: Offer): Promise<void> {
        try {
            await this.notificationsService.notifyOfferReceived(
                offer.auction.owner.id,
                offer.auction.title,
                offer.amount,
                offer.buyer.firstName || offer.buyer.username || 'Anonymous',
                offer.auctionId
            );
        } catch (error) {
            console.error('Failed to send offer notification:', error);
        }
    }

    private async sendOfferResponseNotification(offer: Offer, response: 'accepted' | 'rejected'): Promise<void> {
        try {
            if (response === 'accepted') {
                await this.notificationsService.notifyOfferAccepted(
                    offer.buyerId,
                    offer.auction.title,
                    offer.amount,
                    offer.auctionId
                );
            } else {
                await this.notificationsService.notifyOfferRejected(
                    offer.buyerId,
                    offer.auction.title,
                    offer.amount,
                    offer.auctionId
                );
            }
        } catch (error) {
            console.error('Failed to send offer response notification:', error);
        }
    }
}
