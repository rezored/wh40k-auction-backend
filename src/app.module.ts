import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { BidsModule } from './bids/bids.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/auction',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: process.env.NODE_ENV !== 'production', // Be careful with this in production
        }),
        UserModule,
        AuthModule,
        ListingsModule,
        BidsModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
