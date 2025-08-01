import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { Listing } from './listings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Listing])],
  providers: [ListingsService],
  controllers: [ListingsController]
})
export class ListingsModule {}
