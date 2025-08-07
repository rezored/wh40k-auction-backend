import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Bid } from '../bids/bids.entity';

export enum AuctionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled'
}

export enum AuctionCategory {
  MINIATURES = 'miniatures',
  BOOKS = 'books',
  TERRAIN = 'terrain',
  PAINTS = 'paints',
  ACCESSORIES = 'accessories'
}

export enum AuctionCondition {
  MINT = 'mint',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

@Entity()
export class Auction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column('decimal', { precision: 10, scale: 2 })
    startingPrice: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    currentPrice: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    reservePrice: number;

    @Column({
        type: 'enum',
        enum: AuctionCategory,
        default: AuctionCategory.MINIATURES
    })
    category: AuctionCategory;

    @Column({
        type: 'enum',
        enum: AuctionCondition,
        default: AuctionCondition.GOOD
    })
    condition: AuctionCondition;

    @Column({
        type: 'enum',
        enum: AuctionStatus,
        default: AuctionStatus.ACTIVE
    })
    status: AuctionStatus;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    endTime: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, { eager: true })
    owner: User;

    @OneToMany(() => Bid, bid => bid.auction, { cascade: true })
    bids: Bid[];
} 