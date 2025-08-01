import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Listing } from '../listings/listings.entity';
import { User } from '../user/user.entity';

@Entity()
export class Bid {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    amount: number;

    @ManyToOne(() => User, { eager: true })
    bidder: User;

    @ManyToOne(() => Listing, { eager: true })
    listing: Listing;

    @Column({ default: false })
    accepted: boolean;
}
