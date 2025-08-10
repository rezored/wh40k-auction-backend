import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, Min, MaxLength, IsArray, ValidateNested, ArrayMaxSize, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { AuctionCategory, AuctionCondition, SaleType } from '../auctions.entity';

export class AuctionImageDto {
    @IsString()
    url: string;

    @IsString()
    thumbnailUrl: string;

    @IsString()
    filename: string;

    @IsString()
    originalFilename: string;

    @IsNumber()
    fileSize: number;

    @IsString()
    mimeType: string;

    @IsNumber()
    width: number;

    @IsNumber()
    height: number;

    @IsOptional()
    @IsString()
    altText?: string;
}

export class CreateAuctionEnhancedDto {
    @IsString()
    @MaxLength(100)
    title: string;

    @IsString()
    @MaxLength(1000)
    description: string;

    @IsNumber()
    @Min(0)
    startingPrice: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    reservePrice?: number;

    @IsEnum(AuctionCategory)
    category: AuctionCategory;

    @IsEnum(AuctionCondition)
    condition: AuctionCondition;

    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string; // Legacy support

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AuctionImageDto)
    @ArrayMinSize(1, { message: 'At least one image is required' })
    @ArrayMaxSize(10, { message: 'Maximum 10 images allowed' })
    images: AuctionImageDto[];

    @IsOptional()
    @IsEnum(SaleType)
    saleType?: SaleType;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minOffer?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    offerExpiryDays?: number;

    @IsOptional()
    @IsString()
    categoryGroup?: string;

    @IsOptional()
    @IsString()
    era?: string;

    @IsOptional()
    @IsString()
    scale?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
