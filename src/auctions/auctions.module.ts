import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { Auction } from './auctions.entity';
import { Bid } from '../bids/bids.entity';
import { BidsService } from '../bids/bids.service';
import { OffersModule } from '../offers/offers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Bid]), forwardRef(() => OffersModule)],
  controllers: [AuctionsController],
  providers: [AuctionsService, BidsService],
  exports: [AuctionsService],
})
export class AuctionsModule {} 