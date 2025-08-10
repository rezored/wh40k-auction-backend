import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ScheduleModule } from '@nestjs/schedule';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
// import { OffersCronService } from './offers-cron.service';
import { Offer } from './offers.entity';
import { Auction } from '../auctions/auctions.entity';
import { AuctionsModule } from '../auctions/auctions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Auction]), forwardRef(() => AuctionsModule), NotificationsModule],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule { }
