import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { Bid } from './bids.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid])],
  providers: [BidsService],
  controllers: [BidsController]
})
export class BidsModule {}
