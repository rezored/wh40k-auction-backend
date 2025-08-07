import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { Auction } from './auctions.entity';
import { Bid } from '../bids/bids.entity';
import { BidsService } from '../bids/bids.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Bid])],
  controllers: [AuctionsController],
  providers: [AuctionsService, BidsService],
  exports: [AuctionsService],
})
export class AuctionsModule {} 