import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Auction, AuctionStatus, AuctionCategory, AuctionCondition, SaleType } from './auctions.entity';
import { User } from '../user/user.entity';
import { Bid } from '../bids/bids.entity';
import { AuctionImage, ImageStatus } from './auction-image.entity';
import { CreateAuctionEnhancedDto } from './dto/create-auction-enhanced.dto';
import { AuctionResponseDto, AuctionListResponseDto, SafeUserDto } from './dto/auction-response.dto';

export interface CreateAuctionRequest {
  title: string;
  description: string;
  startingPrice: number;
  reservePrice?: number;
  category: AuctionCategory;
  condition: AuctionCondition;
  endTime?: Date; // Made optional for direct sales
  imageUrl?: string;
  saleType?: SaleType;
  minOffer?: number;
  offerExpiryDays?: number;
  categoryGroup?: string;
  era?: string;
  scale?: string;
  tags?: string[];
}

export interface CreateAuctionEnhancedRequest extends CreateAuctionRequest {
  images: {
    url: string;
    thumbnailUrl: string;
    filename: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    altText?: string;
  }[];
  categoryGroup?: string;
  era?: string;
  scale?: string;
  tags?: string[];
}

export interface UpdateAuctionRequest {
  title?: string;
  description?: string;
  reservePrice?: number;
  category?: AuctionCategory;
  condition?: AuctionCondition;
  endTime?: Date;
  imageUrl?: string;
  saleType?: SaleType;
  minOffer?: number;
  offerExpiryDays?: number;
  categoryGroup?: string;
  era?: string;
  scale?: string;
  tags?: string[];
}

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction) private repo: Repository<Auction>,
    @InjectRepository(Bid) private bidRepo: Repository<Bid>,
    @InjectRepository(AuctionImage) private imageRepo: Repository<AuctionImage>
  ) { }

  private transformToSafeUser(user: User): SafeUserDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username
    };
  }

  private transformToSafeAuction(auction: Auction): AuctionResponseDto {
    return {
      id: auction.id,
      title: auction.title,
      description: auction.description,
      imageUrl: auction.imageUrl,
      images: auction.images || [],
      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,
      reservePrice: auction.reservePrice,
      saleType: auction.saleType,
      minOffer: auction.minOffer,
      offerExpiryDays: auction.offerExpiryDays,
      category: auction.category,
      condition: auction.condition,
      categoryGroup: auction.categoryGroup,
      era: auction.era,
      scale: auction.scale,
      tags: auction.tags,
      status: auction.status,
      createdAt: auction.createdAt,
      endTime: auction.endTime,
      updatedAt: auction.updatedAt,
      owner: this.transformToSafeUser(auction.owner),
      bids: auction.bids || []
    };
  }

  private transformToSafeAuctionList(auction: Auction): AuctionListResponseDto {
    return {
      id: auction.id,
      title: auction.title,
      description: auction.description,
      imageUrl: auction.imageUrl,
      images: auction.images || [],
      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,
      category: auction.category,
      condition: auction.condition,
      categoryGroup: auction.categoryGroup,
      era: auction.era,
      scale: auction.scale,
      tags: auction.tags,
      status: auction.status,
      createdAt: auction.createdAt,
      endTime: auction.endTime,
      owner: this.transformToSafeUser(auction.owner),
      bidCount: auction.bids ? auction.bids.length : 0
    };
  }

  async createAuction(createAuctionDto: CreateAuctionRequest, owner: User): Promise<AuctionResponseDto> {
    const auction = this.repo.create({
      ...createAuctionDto,
      owner,
      currentPrice: createAuctionDto.startingPrice,
      status: AuctionStatus.ACTIVE,
      saleType: createAuctionDto.saleType || SaleType.AUCTION
    });

    const savedAuction = await this.repo.save(auction);
    return this.transformToSafeAuction(savedAuction);
  }

  async createAuctionEnhanced(createAuctionDto: CreateAuctionEnhancedRequest, owner: User): Promise<AuctionResponseDto> {
    // Create the auction first
    const auction = this.repo.create({
      ...createAuctionDto,
      owner,
      currentPrice: createAuctionDto.startingPrice,
      status: AuctionStatus.ACTIVE,
      saleType: createAuctionDto.saleType || SaleType.AUCTION
    });

    const savedAuction = await this.repo.save(auction);

    // Create auction images
    if (createAuctionDto.images && createAuctionDto.images.length > 0) {
      const images = createAuctionDto.images.map((imageData, index) => {
        return this.imageRepo.create({
          auctionId: savedAuction.id,
          filename: imageData.filename,
          originalFilename: imageData.originalFilename,
          url: imageData.url,
          thumbnailUrl: imageData.thumbnailUrl,
          fileSize: imageData.fileSize,
          mimeType: imageData.mimeType,
          width: imageData.width,
          height: imageData.height,
          isMain: index === 0, // First image is main
          order: index,
          status: ImageStatus.ACTIVE,
          altText: imageData.altText
        });
      });

      await this.imageRepo.save(images);
    }

    return this.transformToSafeAuction(savedAuction);
  }

  async findAll(options?: FindManyOptions<Auction>): Promise<AuctionListResponseDto[]> {
    const auctions = await this.repo.find({
      ...options,
      relations: ['owner', 'bids', 'images']
    });

    return auctions.map(auction => this.transformToSafeAuctionList(auction));
  }

  async findActiveAuctions(): Promise<AuctionListResponseDto[]> {
    const auctions = await this.repo.find({
      where: { status: AuctionStatus.ACTIVE },
      relations: ['owner', 'bids', 'images']
    });

    return auctions.map(auction => this.transformToSafeAuctionList(auction));
  }

  async findById(id: number): Promise<AuctionResponseDto> {
    const auction = await this.repo.findOne({
      where: { id },
      relations: ['owner', 'bids', 'bids.bidder']
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    return this.transformToSafeAuction(auction);
  }

  async updateAuction(id: number, updateAuctionDto: UpdateAuctionRequest, user: User): Promise<AuctionResponseDto> {
    const auction = await this.repo.findOne({
      where: { id },
      relations: ['owner', 'bids', 'bids.bidder', 'images']
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('You can only update your own auctions');
    }

    if (auction.status !== AuctionStatus.ACTIVE) {
      throw new BadRequestException('Cannot update ended or cancelled auctions');
    }

    Object.assign(auction, updateAuctionDto);
    const updatedAuction = await this.repo.save(auction);
    return this.transformToSafeAuction(updatedAuction);
  }

  async updateAuctionStatus(id: number, status: AuctionStatus): Promise<void> {
    await this.repo.update(id, { status });
  }

  async deleteAuction(id: number, user: User): Promise<void> {
    const auction = await this.repo.findOne({
      where: { id },
      relations: ['owner', 'bids']
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('You can only delete your own auctions');
    }

    if (auction.bids.length > 0) {
      throw new BadRequestException('Cannot delete auction with existing bids');
    }

    await this.repo.remove(auction);
  }

  async endAuction(id: number, user: User): Promise<AuctionResponseDto> {
    const auction = await this.repo.findOne({
      where: { id },
      relations: ['owner', 'bids', 'bids.bidder', 'images']
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('You can only end your own auctions');
    }

    auction.status = AuctionStatus.ENDED;
    const endedAuction = await this.repo.save(auction);
    return this.transformToSafeAuction(endedAuction);
  }

  async cancelAuction(id: number, user: User): Promise<AuctionResponseDto> {
    const auction = await this.repo.findOne({
      where: { id },
      relations: ['owner', 'bids', 'bids.bidder', 'images']
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('You can only cancel your own auctions');
    }

    auction.status = AuctionStatus.CANCELLED;
    const cancelledAuction = await this.repo.save(auction);
    return this.transformToSafeAuction(cancelledAuction);
  }

  async getAuctionBids(id: number): Promise<Bid[]> {
    const auction = await this.repo.findOne({
      where: { id },
      relations: ['bids', 'bids.bidder']
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    return auction.bids.sort((a, b) => b.amount - a.amount);
  }

  async getWinningBid(auctionId: number): Promise<Bid | null> {
    const auction = await this.repo.findOne({
      where: { id: auctionId },
      relations: ['bids']
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

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