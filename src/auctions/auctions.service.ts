import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Auction, AuctionStatus, AuctionCategory, AuctionCondition } from './auctions.entity';
import { User } from '../user/user.entity';
import { Bid } from '../bids/bids.entity';

export interface CreateAuctionRequest {
  title: string;
  description: string;
  startingPrice: number;
  reservePrice?: number;
  category: AuctionCategory;
  condition: AuctionCondition;
  endTime: Date;
  imageUrl?: string;
}

export interface UpdateAuctionRequest {
  title?: string;
  description?: string;
  reservePrice?: number;
  category?: AuctionCategory;
  condition?: AuctionCondition;
  endTime?: Date;
  imageUrl?: string;
}

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction) private repo: Repository<Auction>,
    @InjectRepository(Bid) private bidRepo: Repository<Bid>
  ) {}

  async createAuction(createAuctionDto: CreateAuctionRequest, owner: User): Promise<Auction> {
    const auction = this.repo.create({
      ...createAuctionDto,
      owner,
      currentPrice: createAuctionDto.startingPrice,
      status: AuctionStatus.ACTIVE
    });

    return this.repo.save(auction);
  }

  async findAll(options?: FindManyOptions<Auction>): Promise<Auction[]> {
    return this.repo.find({
      ...options,
      relations: ['owner', 'bids', 'bids.bidder'],
      order: { createdAt: 'DESC' }
    });
  }

  async findActiveAuctions(): Promise<Auction[]> {
    return this.repo.find({
      where: { status: AuctionStatus.ACTIVE },
      relations: ['owner', 'bids', 'bids.bidder'],
      order: { endTime: 'ASC' }
    });
  }

  async findById(id: number): Promise<Auction> {
    const auction = await this.repo.findOne({
      where: { id },
      relations: ['owner', 'bids', 'bids.bidder']
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    return auction;
  }

  async updateAuction(id: number, updateAuctionDto: UpdateAuctionRequest, user: User): Promise<Auction> {
    const auction = await this.findById(id);

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('You can only update your own auctions');
    }

    if (auction.status !== AuctionStatus.ACTIVE) {
      throw new BadRequestException('Cannot update ended or cancelled auctions');
    }

    Object.assign(auction, updateAuctionDto);
    return this.repo.save(auction);
  }

  async deleteAuction(id: number, user: User): Promise<void> {
    const auction = await this.findById(id);

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('You can only delete your own auctions');
    }

    if (auction.bids.length > 0) {
      throw new BadRequestException('Cannot delete auction with existing bids');
    }

    await this.repo.remove(auction);
  }

  async endAuction(id: number, user: User): Promise<Auction> {
    const auction = await this.findById(id);

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('You can only end your own auctions');
    }

    auction.status = AuctionStatus.ENDED;
    return this.repo.save(auction);
  }

  async cancelAuction(id: number, user: User): Promise<Auction> {
    const auction = await this.findById(id);

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('You can only cancel your own auctions');
    }

    auction.status = AuctionStatus.CANCELLED;
    return this.repo.save(auction);
  }

  async getAuctionBids(id: number): Promise<Bid[]> {
    const auction = await this.findById(id);
    return auction.bids.sort((a, b) => b.amount - a.amount);
  }

  async getWinningBid(auctionId: number): Promise<Bid | null> {
    const auction = await this.findById(auctionId);
    const winningBid = auction.bids.find(bid => bid.isWinningBid);
    return winningBid || null;
  }

  async updateCurrentPrice(auctionId: number, newPrice: number): Promise<void> {
    await this.repo.update(auctionId, { currentPrice: newPrice });
  }

  async checkAndUpdateAuctionStatus(): Promise<void> {
    const activeAuctions = await this.repo.find({
      where: { status: AuctionStatus.ACTIVE },
      relations: ['bids']
    });

    const now = new Date();
    
    for (const auction of activeAuctions) {
      if (auction.endTime <= now) {
        auction.status = AuctionStatus.ENDED;
        await this.repo.save(auction);
      }
    }
  }
} 