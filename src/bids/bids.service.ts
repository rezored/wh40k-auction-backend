import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './bids.entity';
import { User } from '../user/user.entity';
import { Listing } from '../listings/listings.entity';

@Injectable()
export class BidsService {
    constructor(@InjectRepository(Bid) private repo: Repository<Bid>) { }

    placeBid(amount: number, bidder: User, listing: Listing) {
        const bid = this.repo.create({ amount, bidder, listing });
        return this.repo.save(bid);
    }

    acceptBid(bid: Bid) {
        bid.accepted = true;
        return this.repo.save(bid);
    }
}
