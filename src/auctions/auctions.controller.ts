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
    ParseIntPipe,
    UseInterceptors,
    UploadedFiles,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    BadRequestException,
    ForbiddenException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuctionsService } from './auctions.service';
import type { UpdateAuctionRequest } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { CreateAuctionEnhancedDto } from './dto/create-auction-enhanced.dto';
import { AuctionResponseDto, AuctionListResponseDto } from './dto/auction-response.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Auction, AuctionStatus, AuctionCategory, AuctionCondition } from './auctions.entity';
import { Bid } from '../bids/bids.entity';
import { BidsService } from '../bids/bids.service';
import { OffersService } from '../offers/offers.service';
import { ImageService } from './image.service';
import { ImageReorderRequestDto } from './dto/image-upload.dto';

@Controller('auctions')
export class AuctionsController {
    constructor(
        private auctionsService: AuctionsService,
        private bidsService: BidsService,
        private offersService: OffersService,
        private imageService: ImageService
    ) { }

    @Get()
    async getAllAuctions(
        @Query('status') status?: AuctionStatus,
        @Query('category') category?: AuctionCategory,
        @Query('condition') condition?: AuctionCondition,
        @Query('search') search?: string
    ): Promise<AuctionListResponseDto[]> {
        if (status === AuctionStatus.ACTIVE) {
            return this.auctionsService.findActiveAuctions();
        }

        return this.auctionsService.findAll();
    }

    @Get('active')
    async getActiveAuctions(): Promise<AuctionListResponseDto[]> {
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
    async getAuctionById(@Param('id', ParseIntPipe) id: number): Promise<AuctionResponseDto> {
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
    ): Promise<AuctionResponseDto> {
        const createAuctionRequest = {
            ...createAuctionDto,
            endTime: createAuctionDto.endTime ? new Date(createAuctionDto.endTime) : undefined
        };
        return this.auctionsService.createAuction(createAuctionRequest, req.user);
    }

    @Post('enhanced')
    @UseGuards(JwtAuthGuard)
    async createAuctionEnhanced(
        @Body() createAuctionDto: CreateAuctionEnhancedDto,
        @Request() req
    ): Promise<AuctionResponseDto> {
        const createAuctionRequest = {
            ...createAuctionDto,
            endTime: createAuctionDto.endTime ? new Date(createAuctionDto.endTime) : undefined
        };
        return this.auctionsService.createAuctionEnhanced(createAuctionRequest, req.user);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateAuction(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAuctionDto: UpdateAuctionRequest,
        @Request() req
    ): Promise<AuctionResponseDto> {
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
    ): Promise<AuctionResponseDto> {
        return this.auctionsService.endAuction(id, req.user);
    }

    @Post(':id/cancel')
    @UseGuards(JwtAuthGuard)
    async cancelAuction(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ): Promise<AuctionResponseDto> {
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

    // Image Upload Endpoint
    @Post(':auctionId/images/upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('images', 10, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit
        },
    }))
    async uploadImages(
        @Param('auctionId', ParseIntPipe) auctionId: number,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                ],
            }),
        )
        files: Express.Multer.File[],
        @Request() req
    ) {
        // Verify user owns the auction
        const auction = await this.auctionsService.findById(auctionId);
        if (auction.owner.id !== req.user.id) {
            throw new ForbiddenException('You can only upload images to your own auctions');
        }

        if (!files || files.length === 0) {
            throw new BadRequestException('No images provided');
        }

        if (files.length > 10) {
            throw new BadRequestException('Maximum 10 images allowed');
        }

        const uploadedImages = await this.imageService.uploadImages(files, auctionId);

        return {
            message: 'Images uploaded successfully',
            count: uploadedImages.length,
            uploadId: Date.now().toString(),
            images: uploadedImages
        };
    }

    // Image Management Endpoints
    @Put(':auctionId/images/:imageId/main')
    @UseGuards(JwtAuthGuard)
    async setMainImage(
        @Param('auctionId', ParseIntPipe) auctionId: number,
        @Param('imageId', ParseIntPipe) imageId: number,
        @Request() req
    ) {
        // Verify user owns the auction
        const auction = await this.auctionsService.findById(auctionId);
        if (auction.owner.id !== req.user.id) {
            throw new ForbiddenException('You can only modify your own auctions');
        }

        const image = await this.imageService.setMainImage(auctionId, imageId);
        return { message: 'Main image updated successfully', image };
    }

    @Delete(':auctionId/images/:imageId')
    @UseGuards(JwtAuthGuard)
    async deleteImage(
        @Param('auctionId', ParseIntPipe) auctionId: number,
        @Param('imageId', ParseIntPipe) imageId: number,
        @Request() req
    ) {
        // Verify user owns the auction
        const auction = await this.auctionsService.findById(auctionId);
        if (auction.owner.id !== req.user.id) {
            throw new ForbiddenException('You can only modify your own auctions');
        }

        await this.imageService.deleteImage(auctionId, imageId);
        return { message: 'Image deleted successfully' };
    }

    @Put(':auctionId/images/reorder')
    @UseGuards(JwtAuthGuard)
    async reorderImages(
        @Param('auctionId', ParseIntPipe) auctionId: number,
        @Body() reorderRequest: ImageReorderRequestDto,
        @Request() req
    ) {
        // Verify user owns the auction
        const auction = await this.auctionsService.findById(auctionId);
        if (auction.owner.id !== req.user.id) {
            throw new ForbiddenException('You can only modify your own auctions');
        }

        await this.imageService.reorderImages(auctionId, reorderRequest.images);
        return { message: 'Images reordered successfully' };
    }

    @Get(':auctionId/images')
    async getAuctionImages(@Param('auctionId', ParseIntPipe) auctionId: number) {
        const images = await this.imageService.getAuctionImages(auctionId);
        return { images };
    }
} 