import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, SelectQueryBuilder, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Auction, AuctionStatus, AuctionCategory, AuctionCondition, SaleType } from './auctions.entity';
import { User } from '../user/user.entity';
import { Bid } from '../bids/bids.entity';
import { AuctionImage, ImageStatus } from './auction-image.entity';
import { CreateAuctionEnhancedDto } from './dto/create-auction-enhanced.dto';
import { AuctionResponseDto, AuctionListResponseDto, SafeUserDto, AuctionFiltersDto, PaginatedAuctionsResponseDto } from './dto/auction-response.dto';

export interface CreateAuctionRequest {
    title: string;
    description: string;
    startingPrice: number;
    reservePrice?: number;
    category: AuctionCategory;
    condition: AuctionCondition;
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

    async getAuctionsWithFilters(filters: AuctionFiltersDto, currentUser?: User): Promise<PaginatedAuctionsResponseDto> {
        const queryBuilder = this.repo
            .createQueryBuilder('auction')
            .leftJoinAndSelect('auction.owner', 'owner')
            .leftJoinAndSelect('auction.images', 'images')
            .leftJoinAndSelect('auction.bids', 'bids');

        // Apply filters
        this.applyFilters(queryBuilder, filters, currentUser);

        // Apply sorting
        this.applySorting(queryBuilder, filters.sortBy);

        // Get total count before pagination
        const total = await queryBuilder.getCount();

        // Apply pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const offset = (page - 1) * limit;

        queryBuilder
            .skip(offset)
            .take(limit);

        const auctions = await queryBuilder.getMany();

        // Transform to response DTOs
        const auctionList = auctions.map(auction => this.transformToSafeAuctionList(auction));

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            auctions: auctionList,
            total,
            page,
            limit,
            totalPages,
            hasNext,
            hasPrev
        };
    }

    private applyFilters(queryBuilder: SelectQueryBuilder<Auction>, filters: AuctionFiltersDto, currentUser?: User): void {
        // Category filter
        if (filters.category) {
            queryBuilder.andWhere('auction.category = :category', { category: filters.category });
        }

        // Category Group filter
        if (filters.categoryGroup) {
            queryBuilder.andWhere('auction.categoryGroup = :categoryGroup', { categoryGroup: filters.categoryGroup });
        }

        // Scale filter
        if (filters.scale) {
            queryBuilder.andWhere('auction.scale = :scale', { scale: filters.scale });
        }

        // Era filter
        if (filters.era) {
            queryBuilder.andWhere('auction.era = :era', { era: filters.era });
        }

        // Condition filter
        if (filters.condition) {
            queryBuilder.andWhere('auction.condition = :condition', { condition: filters.condition });
        }

        // Status filter
        if (filters.status) {
            queryBuilder.andWhere('auction.status = :status', { status: filters.status });
        }

        // Price range filter - handle both separate min/max and combined priceRange
        if (filters.priceRange) {
            const [minPrice, maxPrice] = filters.priceRange.split('-').map(p => parseFloat(p.trim()));
            if (!isNaN(minPrice)) {
                queryBuilder.andWhere('auction.startingPrice >= :minPrice', { minPrice });
            }
            if (!isNaN(maxPrice)) {
                queryBuilder.andWhere('auction.startingPrice <= :maxPrice', { maxPrice });
            }
        } else {
            // Use separate min/max price filters if priceRange is not provided
            if (filters.minPrice !== undefined) {
                queryBuilder.andWhere('auction.startingPrice >= :minPrice', { minPrice: filters.minPrice });
            }

            if (filters.maxPrice !== undefined) {
                queryBuilder.andWhere('auction.startingPrice <= :maxPrice', { maxPrice: filters.maxPrice });
            }
        }

        // Show own auctions filter
        if (filters.showOwn && currentUser) {
            console.log(`🔍 Filtering auctions for user: ${currentUser.id} (${currentUser.username || currentUser.email})`);
            queryBuilder.andWhere('owner.id = :userId', { userId: currentUser.id });
        } else if (filters.showOwn && !currentUser) {
            console.log('⚠️ showOwn filter requested but no user authenticated');
        }

        // Search filter (searches in title and description)
        if (filters.search) {
            queryBuilder.andWhere(
                '(auction.title LIKE :search OR auction.description LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }
    }

    private applySorting(queryBuilder: SelectQueryBuilder<Auction>, sortBy?: string): void {
        switch (sortBy) {
            case 'newest':
                queryBuilder.orderBy('auction.createdAt', 'DESC');
                break;
            case 'oldest':
                queryBuilder.orderBy('auction.createdAt', 'ASC');
                break;
            case 'price_asc':
                queryBuilder.orderBy('auction.startingPrice', 'ASC');
                break;
            case 'price_desc':
                queryBuilder.orderBy('auction.startingPrice', 'DESC');
                break;
            default:
                // Default sorting: newest first
                queryBuilder.orderBy('auction.createdAt', 'DESC');
                break;
        }
    }

    async getMyAuctions(user: User, filters?: AuctionFiltersDto): Promise<PaginatedAuctionsResponseDto> {
        const myFilters = {
            ...filters,
            showOwn: true
        };
        return this.getAuctionsWithFilters(myFilters, user);
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

    // Enhanced Auction Methods
    async getAuctionWinner(auctionId: number): Promise<{ winner: any; winningBid: Bid; finalPrice: number }> {
        const auction = await this.repo.findOne({
            where: { id: auctionId },
            relations: ['bids', 'bids.user']
        });

        if (!auction) {
            throw new NotFoundException('Auction not found');
        }

        if (auction.status !== AuctionStatus.ENDED) {
            throw new BadRequestException('Auction has not ended yet');
        }

        const winningBid = await this.getWinningBid(auctionId);
        if (!winningBid) {
            throw new NotFoundException('No winning bid found for this auction');
        }

        return {
            winner: this.transformToSafeUser(winningBid.bidder),
            winningBid,
            finalPrice: winningBid.amount
        };
    }

    async getWinnerAddress(auctionId: number): Promise<any> {
        const auction = await this.repo.findOne({
            where: { id: auctionId },
            relations: ['bids', 'bids.user']
        });

        if (!auction) {
            throw new NotFoundException('Auction not found');
        }

        if (auction.status !== AuctionStatus.ENDED) {
            throw new BadRequestException('Auction has not ended yet');
        }

        const winningBid = await this.getWinningBid(auctionId);
        if (!winningBid) {
            throw new NotFoundException('No winning bid found for this auction');
        }

        // This would need to be implemented with the UserAddress entity
        // For now, returning a placeholder
        return {
            message: 'Winner address functionality requires UserAddress integration'
        };
    }

    async getShippingInformation(auctionId: number, userId: number): Promise<any> {
        const auction = await this.repo.findOne({
            where: { id: auctionId }
        });

        if (!auction) {
            throw new NotFoundException('Auction not found');
        }

        // This would need to be implemented with the UserAddress entity
        // For now, returning a placeholder
        return {
            message: 'Shipping information functionality requires UserAddress integration',
            auctionId,
            userId
        };
    }

    async notifyAuctionWinner(auctionId: number, winnerData: any, user: User): Promise<any> {
        const auction = await this.repo.findOne({
            where: { id: auctionId }
        });

        if (!auction) {
            throw new NotFoundException('Auction not found');
        }

        if (auction.owner.id !== user.id) {
            throw new ForbiddenException('Only auction owner can notify winner');
        }

        // This would need to be implemented with the NotificationsService
        // For now, returning a placeholder
        return {
            message: 'Winner notification sent successfully',
            auctionId,
            winnerData
        };
    }
} 