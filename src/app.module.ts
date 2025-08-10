import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { OffersModule } from './offers/offers.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL || 'postgres://wh40k_user:wh40k_password_2024@127.0.0.1:5432/wh40k_auction',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Be careful with this in production
        }),
        ThrottlerModule.forRoot([{
            ttl: parseInt(process.env.THROTTLE_TTL || '60'),
            limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
        }]),
        UserModule,
        AuthModule,
        AuctionsModule,
        BidsModule,
        OffersModule,
        NotificationsModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
