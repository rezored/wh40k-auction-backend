import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OffersService } from './offers.service';

@Injectable()
export class OffersCronService {
    constructor(private offersService: OffersService) {}

    @Cron(CronExpression.EVERY_HOUR)
    async handleOfferExpiration() {
        console.log('🕐 Running offer expiration check...');
        try {
            await this.offersService.expireOffers();
            console.log('✅ Offer expiration check completed');
        } catch (error) {
            console.error('❌ Error during offer expiration check:', error);
        }
    }
}
