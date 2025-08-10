import { AuctionStatus, AuctionCategory, AuctionCondition, SaleType } from '../auctions.entity';
import { AuctionImage } from '../auction-image.entity';
import { Bid } from '../../bids/bids.entity';

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
