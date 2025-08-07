import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, Min, MaxLength } from 'class-validator';
import { AuctionCategory, AuctionCondition } from '../auctions.entity';

export class CreateAuctionDto {
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

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
} 