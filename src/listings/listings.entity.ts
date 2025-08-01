import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Listing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column()
    imageUrl: string;

    @Column({ default: 0 })
    price: number;

    @Column({ default: true })
    openForOffers: boolean;

    @ManyToOne(() => User, (user) => user.id, { eager: true })
    owner: User;
}
