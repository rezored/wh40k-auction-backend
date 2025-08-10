import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UserAddress } from './user-address.entity';
import { UserProfileDto, UpdateProfileRequestDto, ChangePasswordRequestDto } from './dto/user-profile.dto';
import { AddAddressRequestDto, UpdateAddressRequestDto } from './dto/address.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserAddress)
        private userAddressRepository: Repository<UserAddress>,
    ) { }

    async createUser(userDto: User): Promise<User> {
        const user = this.userRepository.create(userDto);
        return this.userRepository.save(user);
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async getUserProfile(userId: number): Promise<UserProfileDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['addresses']
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            addresses: user.addresses || [],
            preferences: user.preferences || {
                emailNotifications: true,
                smsNotifications: false,
                currency: 'USD'
            },
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    async updateUserProfile(userId: number, updateData: UpdateProfileRequestDto): Promise<UserProfileDto> {
        const user = await this.findById(userId);

        // Check if username is being changed and if it's already taken
        if (updateData.username && updateData.username !== user.username) {
            const existingUser = await this.userRepository.findOne({
                where: { username: updateData.username }
            });
            if (existingUser) {
                throw new ConflictException('Username already taken');
            }
        }

        // Update user fields
        Object.assign(user, updateData);
        await this.userRepository.save(user);

        return this.getUserProfile(userId);
    }

    async changePassword(userId: number, changePasswordData: ChangePasswordRequestDto): Promise<{ message: string }> {
        const user = await this.findById(userId);

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(changePasswordData.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Verify new password confirmation
        if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
            throw new BadRequestException('New password and confirmation do not match');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(changePasswordData.newPassword, 10);
        user.password = hashedPassword;
        await this.userRepository.save(user);

        return { message: 'Password changed successfully' };
    }

    // Address Management Methods
    async getUserAddresses(userId: number): Promise<UserAddress[]> {
        return this.userAddressRepository.find({
            where: { userId },
            order: { isDefault: 'DESC', createdAt: 'ASC' }
        });
    }

    async addUserAddress(userId: number, addressData: AddAddressRequestDto): Promise<UserAddress> {
        // If this is the first address or isDefault is true, unset other default addresses
        if (addressData.isDefault) {
            await this.userAddressRepository.update(
                { userId, isDefault: true },
                { isDefault: false }
            );
        }

        const address = this.userAddressRepository.create({
            ...addressData,
            userId
        });

        return this.userAddressRepository.save(address);
    }

    async updateUserAddress(userId: number, addressId: number, addressData: UpdateAddressRequestDto): Promise<UserAddress> {
        const address = await this.userAddressRepository.findOne({
            where: { id: addressId, userId }
        });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        // If setting as default, unset other default addresses
        if (addressData.isDefault) {
            await this.userAddressRepository.update(
                { userId, isDefault: true, id: addressId },
                { isDefault: false }
            );
        }

        Object.assign(address, addressData);
        return this.userAddressRepository.save(address);
    }

    async deleteUserAddress(userId: number, addressId: number): Promise<{ message: string }> {
        const address = await this.userAddressRepository.findOne({
            where: { id: addressId, userId }
        });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        await this.userAddressRepository.remove(address);
        return { message: 'Address deleted successfully' };
    }

    async setDefaultAddress(userId: number, addressId: number): Promise<{ message: string }> {
        const address = await this.userAddressRepository.findOne({
            where: { id: addressId, userId }
        });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        // Unset all other default addresses for this user
        await this.userAddressRepository.update(
            { userId, isDefault: true },
            { isDefault: false }
        );

        // Set this address as default
        address.isDefault = true;
        await this.userAddressRepository.save(address);

        return { message: 'Default address updated successfully' };
    }

    async getDefaultAddress(userId: number): Promise<UserAddress> {
        const address = await this.userAddressRepository.findOne({
            where: { userId, isDefault: true }
        });

        if (!address) {
            throw new NotFoundException('No default address found');
        }

        return address;
    }

    async getUserById(userId: number): Promise<User> {
        return this.findById(userId);
    }
}