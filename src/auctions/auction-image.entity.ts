import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Auction } from './auctions.entity';

export enum ImageStatus {
    ACTIVE = 'active',
    DELETED = 'deleted'
}

@Entity('auction_images')
@Index(['auctionId', 'isMain'])
@Index(['auctionId', 'order'])
export class AuctionImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    auctionId: number;

    @Column()
    filename: string;

    @Column()
    originalFilename: string;

    @Column()
    url: string;

    @Column()
    thumbnailUrl: string;

    @Column('int')
    fileSize: number;

    @Column()
    mimeType: string;

    @Column('int')
    width: number;

    @Column('int')
    height: number;

    @Column({ default: false })
    isMain: boolean;

    @Column('int', { default: 0 })
    order: number;

    @Column({
        type: 'enum',
        enum: ImageStatus,
        default: ImageStatus.ACTIVE
    })
    status: ImageStatus;

    @Column('text', { nullable: true })
    altText: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Auction, auction => auction.images, { onDelete: 'CASCADE' })
    auction: Auction;
}
