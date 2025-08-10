import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, Min, MaxLength, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AuctionCategory, AuctionCondition, SaleType } from '../auctions.entity';

export class CreateAuctionDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  startingPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  reservePrice?: number;

  @IsEnum(AuctionCategory)
  category: AuctionCategory;

  @IsOptional()
  @IsString()
  categoryGroup?: string;

  @IsEnum(AuctionCondition)
  condition: AuctionCondition;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(SaleType)
  saleType?: SaleType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  minOffer?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  offerExpiryDays?: number;

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