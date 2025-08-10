import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './bids.entity';
import { User } from '../user/user.entity';
import { Auction, AuctionStatus } from '../auctions/auctions.entity';
import { AuctionsService } from '../auctions/auctions.service';

@Injectable()
export class BidsService {
    constructor(
        @InjectRepository(Bid) private repo: Repository<Bid>,
        private auctionsService: AuctionsService
    ) { }

    async placeBid(amount: number, bidder: User, auctionId: number): Promise<Bid> {
        const auction = await this.auctionsService.findById(auctionId);

        // Validate auction status
        if (auction.status !== AuctionStatus.ACTIVE) {
            throw new BadRequestException('Cannot bid on inactive auction');
        }

        // Check if auction has ended
        if (auction.endTime && auction.endTime <= new Date()) {
            throw new BadRequestException('Auction has ended');
        }

        // Validate bid amount
        if (amount <= auction.currentPrice) {
            throw new BadRequestException('Bid must be higher than current price');
        }

        // Check reserve price
        if (auction.reservePrice && amount < auction.reservePrice) {
            throw new BadRequestException('Bid must meet or exceed reserve price');
        }

        // Check if user is bidding on their own auction
        // if (auction.owner.id === bidder.id) {
        //     throw new ForbiddenException('Cannot bid on your own auction');
        // }

        // Create the bid
        const bid = this.repo.create({
            amount,
            bidder,
            auction,
            isWinningBid: true
        });

        // Update previous winning bid
        await this.updatePreviousWinningBid(auctionId);

        // Update auction current price
        await this.auctionsService.updateCurrentPrice(auctionId, amount);

        return this.repo.save(bid);
    }

    private async updatePreviousWinningBid(auctionId: number): Promise<void> {
        const previousWinningBid = await this.repo.findOne({
            where: { auction: { id: auctionId }, isWinningBid: true }
        });

        if (previousWinningBid) {
            previousWinningBid.isWinningBid = false;
            await this.repo.save(previousWinningBid);
        }
    }

    async getBidsByAuction(auctionId: number): Promise<Bid[]> {
        return this.repo.find({
            where: { auction: { id: auctionId } },
            relations: ['bidder', 'auction'],
            order: { amount: 'DESC', createdAt: 'ASC' }
        });
    }

    async getBidsByUser(userId: number): Promise<Bid[]> {
        return this.repo.find({
            where: { bidder: { id: userId } },
            relations: ['auction', 'bidder'],
            order: { createdAt: 'DESC' }
        });
    }

    async getWinningBid(auctionId: number): Promise<Bid | null> {
        return this.repo.findOne({
            where: { auction: { id: auctionId }, isWinningBid: true },
            relations: ['bidder', 'auction']
        });
    }

    async getBidById(bidId: number): Promise<Bid> {
        const bid = await this.repo.findOne({
            where: { id: bidId },
            relations: ['bidder', 'auction']
        });

        if (!bid) {
            throw new NotFoundException('Bid not found');
        }

        return bid;
    }

    async cancelBid(bidId: number, userId: number): Promise<void> {
        const bid = await this.getBidById(bidId);

        if (bid.bidder.id !== userId) {
            throw new ForbiddenException('You can only cancel your own bids');
        }

        if (bid.isWinningBid) {
            throw new BadRequestException('Cannot cancel winning bid');
        }

        await this.repo.remove(bid);
    }
}
