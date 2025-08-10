import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Auction } from '../auctions/auctions.entity';

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

@Entity()
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  auctionId: number;

  @Column()
  buyerId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('text', { nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.PENDING
  })
  status: OfferStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  acceptedAt: Date;

  @ManyToOne(() => User, { eager: true })
  buyer: User;

  @ManyToOne(() => Auction, { eager: true })
  auction: Auction;
}
