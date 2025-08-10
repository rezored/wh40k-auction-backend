import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuctionImage, ImageStatus } from './auction-image.entity';
import { UploadedImageDto } from './dto/image-upload.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(AuctionImage)
        private auctionImageRepository: Repository<AuctionImage>
    ) { }

    async uploadImages(files: Express.Multer.File[], auctionId?: number): Promise<UploadedImageDto[]> {
        const uploadedImages: UploadedImageDto[] = [];
        const uploadId = uuidv4();

        for (const file of files) {
            try {
                // Validate file
                this.validateImageFile(file);

                // Generate unique filename
                const filename = this.generateFilename(file.originalname);

                // Create directories if they don't exist
                const uploadDir = path.join(process.cwd(), 'uploads', 'auctions');
                const thumbnailDir = path.join(uploadDir, 'thumbnails');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                if (!fs.existsSync(thumbnailDir)) {
                    fs.mkdirSync(thumbnailDir, { recursive: true });
                }

                // Save original file using buffer
                const filePath = path.join(uploadDir, filename);
                fs.writeFileSync(filePath, file.buffer);

                // Generate thumbnail (simplified - in production use sharp or similar)
                const thumbnailFilename = `thumb_${filename}`;
                const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
                fs.copyFileSync(filePath, thumbnailPath); // Copy the saved file

                // Get image dimensions (simplified - in production use sharp or similar)
                const dimensions = await this.getImageDimensions(file.buffer);

                // Create image URLs
                const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
                const url = `${baseUrl}/uploads/auctions/${filename}`;
                const thumbnailUrl = `${baseUrl}/uploads/auctions/thumbnails/${thumbnailFilename}`;

                const imageData: UploadedImageDto = {
                    filename,
                    originalFilename: file.originalname,
                    url,
                    thumbnailUrl,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    width: dimensions.width,
                    height: dimensions.height,
                    isMain: uploadedImages.length === 0 // First image is main by default
                };

                uploadedImages.push(imageData);

                // Save to database if auctionId is provided
                if (auctionId) {
                    await this.saveImageToDatabase(imageData, auctionId);
                }

            } catch (error) {
                throw new InternalServerErrorException(`Failed to upload image ${file.originalname}: ${error.message}`);
            }
        }

        return uploadedImages;
    }

    private validateImageFile(file: Express.Multer.File): void {
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new BadRequestException(`File ${file.originalname} is too large. Maximum size is 10MB.`);
        }

        // Check file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`File type ${file.mimetype} is not supported. Allowed types: JPG, PNG, WebP.`);
        }
    }

    private generateFilename(originalName: string): string {
        const extension = path.extname(originalName);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `${timestamp}_${random}${extension}`;
    }

    private async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
        // Simplified implementation - in production use sharp or similar library
        // For now, return default dimensions
        return { width: 800, height: 600 };
    }

    private async saveImageToDatabase(imageData: UploadedImageDto, auctionId: number): Promise<AuctionImage> {
        const image = this.auctionImageRepository.create({
            auctionId,
            filename: imageData.filename,
            originalFilename: imageData.originalFilename,
            url: imageData.url,
            thumbnailUrl: imageData.thumbnailUrl,
            fileSize: imageData.fileSize,
            mimeType: imageData.mimeType,
            width: imageData.width,
            height: imageData.height,
            isMain: imageData.isMain || false,
            order: 0,
            status: ImageStatus.ACTIVE
        });

        return this.auctionImageRepository.save(image);
    }

    async setMainImage(auctionId: number, imageId: number): Promise<AuctionImage> {
        // First, unset all main images for this auction
        await this.auctionImageRepository.update(
            { auctionId, isMain: true },
            { isMain: false }
        );

        // Set the new main image
        const image = await this.auctionImageRepository.findOne({
            where: { id: imageId, auctionId }
        });

        if (!image) {
            throw new BadRequestException('Image not found');
        }

        image.isMain = true;
        return this.auctionImageRepository.save(image);
    }

    async deleteImage(auctionId: number, imageId: number): Promise<void> {
        const image = await this.auctionImageRepository.findOne({
            where: { id: imageId, auctionId }
        });

        if (!image) {
            throw new BadRequestException('Image not found');
        }

        // Soft delete
        image.status = ImageStatus.DELETED;
        await this.auctionImageRepository.save(image);

        // If this was the main image, set another image as main
        if (image.isMain) {
            const nextImage = await this.auctionImageRepository.findOne({
                where: { auctionId, status: ImageStatus.ACTIVE },
                order: { order: 'ASC' }
            });

            if (nextImage) {
                nextImage.isMain = true;
                await this.auctionImageRepository.save(nextImage);
            }
        }
    }

    async reorderImages(auctionId: number, imageOrders: { imageId: number; newOrder: number }[]): Promise<void> {
        for (const { imageId, newOrder } of imageOrders) {
            await this.auctionImageRepository.update(
                { id: imageId, auctionId },
                { order: newOrder }
            );
        }
    }

    async getAuctionImages(auctionId: number): Promise<AuctionImage[]> {
        return this.auctionImageRepository.find({
            where: { auctionId, status: ImageStatus.ACTIVE },
            order: { order: 'ASC' }
        });
    }
}
