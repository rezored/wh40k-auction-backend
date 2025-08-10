import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { Auction } from './auctions.entity';
import { AuctionImage } from './auction-image.entity';
import { Bid } from '../bids/bids.entity';
import { BidsService } from '../bids/bids.service';
import { OffersModule } from '../offers/offers.module';
import { ImageService } from './image.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, AuctionImage, Bid]),
    forwardRef(() => OffersModule),
    MulterModule.register({
      storage: undefined, // Use memory storage
    }),
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, BidsService, ImageService],
  exports: [AuctionsService, ImageService],
})
export class AuctionsModule { } 