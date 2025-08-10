import { AuctionStatus, AuctionCategory, AuctionCondition, SaleType } from '../auctions.entity';
import { AuctionImage } from '../auction-image.entity';
import { Bid } from '../../bids/bids.entity';
import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SafeUserDto {
    id: number;
    email: string;
    username?: string;
}

export class AuctionResponseDto {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    images: AuctionImage[];
    startingPrice: number;
    currentPrice: number;
    reservePrice?: number;
    saleType: SaleType;
    minOffer?: number;
    offerExpiryDays?: number;
    category: AuctionCategory;
    condition: AuctionCondition;
    categoryGroup?: string;
    era?: string;
    scale?: string;
    tags?: string[];
    status: AuctionStatus;
    createdAt: Date;
    endTime?: Date;
    updatedAt: Date;
    owner: SafeUserDto;
    bids: Bid[];
}

export class AuctionListResponseDto {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    images: AuctionImage[];
    startingPrice: number;
    currentPrice: number;
    category: AuctionCategory;
    condition: AuctionCondition;
    categoryGroup?: string;
    era?: string;
    scale?: string;
    tags?: string[];
    status: AuctionStatus;
    createdAt: Date;
    endTime?: Date;
    owner: SafeUserDto;
    bidCount: number;
}

export class AuctionFiltersDto {
    @IsOptional()
    @IsEnum(AuctionCategory)
    category?: AuctionCategory;

    @IsOptional()
    @IsString()
    categoryGroup?: string;

    @IsOptional()
    @IsString()
    scale?: string;

    @IsOptional()
    @IsString()
    era?: string;

    @IsOptional()
    @IsEnum(AuctionCondition)
    condition?: AuctionCondition;

    @IsOptional()
    @IsEnum(AuctionStatus)
    status?: AuctionStatus;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsString()
    priceRange?: string; // For frontend compatibility

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return undefined;
    })
    @IsBoolean()
    showOwn?: boolean;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return undefined;
    })
    @IsBoolean()
    show_own?: boolean; // Backward compatibility

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}

export class PaginatedAuctionsResponseDto {
    auctions: AuctionListResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
