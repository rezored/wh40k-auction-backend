import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserProfileDto, UpdateProfileRequestDto, ChangePasswordRequestDto } from './dto/user-profile.dto';
import { AddAddressRequestDto, UpdateAddressRequestDto } from './dto/address.dto';
import { UserAddress } from './user-address.entity';

@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getUserProfile(@Request() req): Promise<UserProfileDto> {
        return this.userService.getUserProfile(req.user.id);
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    async updateUserProfile(
        @Request() req,
        @Body() updateData: UpdateProfileRequestDto
    ): Promise<UserProfileDto> {
        return this.userService.updateUserProfile(req.user.id, updateData);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @Request() req,
        @Body() changePasswordData: ChangePasswordRequestDto
    ): Promise<{ message: string }> {
        return this.userService.changePassword(req.user.id, changePasswordData);
    }

    // Address Management Endpoints
    @Get('addresses')
    @UseGuards(JwtAuthGuard)
    async getUserAddresses(@Request() req): Promise<UserAddress[]> {
        return this.userService.getUserAddresses(req.user.id);
    }

    @Post('addresses')
    @UseGuards(JwtAuthGuard)
    async addUserAddress(
        @Request() req,
        @Body() addressData: AddAddressRequestDto
    ): Promise<UserAddress> {
        return this.userService.addUserAddress(req.user.id, addressData);
    }

    @Put('addresses/:addressId')
    @UseGuards(JwtAuthGuard)
    async updateUserAddress(
        @Request() req,
        @Param('addressId', ParseIntPipe) addressId: number,
        @Body() addressData: UpdateAddressRequestDto
    ): Promise<UserAddress> {
        return this.userService.updateUserAddress(req.user.id, addressId, addressData);
    }

    @Delete('addresses/:addressId')
    @UseGuards(JwtAuthGuard)
    async deleteUserAddress(
        @Request() req,
        @Param('addressId', ParseIntPipe) addressId: number
    ): Promise<{ message: string }> {
        return this.userService.deleteUserAddress(req.user.id, addressId);
    }

    @Post('addresses/:addressId/set-default')
    @UseGuards(JwtAuthGuard)
    async setDefaultAddress(
        @Request() req,
        @Param('addressId', ParseIntPipe) addressId: number
    ): Promise<{ message: string }> {
        return this.userService.setDefaultAddress(req.user.id, addressId);
    }

    @Get(':userId/default-address')
    @UseGuards(JwtAuthGuard)
    async getDefaultAddress(@Param('userId', ParseIntPipe) userId: number): Promise<UserAddress> {
        return this.userService.getDefaultAddress(userId);
    }
}
