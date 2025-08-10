import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserAddress } from './user-address.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    username: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ type: 'json', nullable: true })
    preferences: {
        emailNotifications?: boolean;
        smsNotifications?: boolean;
        currency?: string;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => UserAddress, address => address.user)
    addresses: UserAddress[];
}
