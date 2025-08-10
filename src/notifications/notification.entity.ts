import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Auction } from '../auctions/auctions.entity';
import { Offer } from '../offers/offers.entity';

export enum NotificationType {
    AUCTION_WON = 'auction_won',
    OFFER_ACCEPTED = 'offer_accepted',
    BID_OUTBID = 'bid_outbid',
    AUCTION_ENDING = 'auction_ending',
    GENERAL = 'general'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.GENERAL
    })
    type: NotificationType;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ nullable: true })
    auctionId: number;

    @Column({ nullable: true })
    offerId: number;

    @Column()
    recipientId: number;

    @Column({ nullable: true })
    senderId: number;

    @Column({ default: false })
    isRead: boolean;

    @Column({ type: 'json', nullable: true })
    metadata: {
        winnerAddress?: any;
        finalPrice?: number;
        shippingInfo?: any;
    };

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'recipientId' })
    recipient: User;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'senderId' })
    sender: User;

    @ManyToOne(() => Auction, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'auctionId' })
    auction: Auction;

    @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'offerId' })
    offer: Offer;
}
