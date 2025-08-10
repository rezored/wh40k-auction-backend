import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum NotificationType {
    BID_PLACED = 'bid_placed',
    BID_OUTBID = 'bid_outbid',
    OFFER_RECEIVED = 'offer_received',
    OFFER_ACCEPTED = 'offer_accepted',
    OFFER_REJECTED = 'offer_rejected',
    OFFER_EXPIRED = 'offer_expired',
    AUCTION_ENDED = 'auction_ended',
    AUCTION_WON = 'auction_won'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({
        type: 'enum',
        enum: NotificationType
    })
    type: NotificationType;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column('jsonb', { default: {} })
    data: any;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, user => user.id)
    user: User;
}
