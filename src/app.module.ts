import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { OffersModule } from './offers/offers.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL || 'postgres://wh40k_user:wh40k_password@localhost:5432/wh40k_auction',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: process.env.NODE_ENV !== 'production', // Be careful with this in production
        }),
        UserModule,
        AuthModule,
        AuctionsModule,
        BidsModule,
        OffersModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
