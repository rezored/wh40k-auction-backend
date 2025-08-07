import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Auction } from '../auctions/auctions.entity';
import { User } from '../user/user.entity';

@Entity()
export class Bid {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @ManyToOne(() => User, { eager: true })
    bidder: User;

    @ManyToOne(() => Auction, auction => auction.bids, { eager: true })
    auction: Auction;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: false })
    isWinningBid: boolean;
}
