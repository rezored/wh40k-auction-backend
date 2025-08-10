import { IsOptional, IsString, IsBoolean, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { UserAddress } from '../user-address.entity';

export class UserProfileDto {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    addresses: UserAddress[];
    preferences?: {
        emailNotifications?: boolean;
        smsNotifications?: boolean;
        currency?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export class UpdateProfileRequestDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    preferences?: {
        currency?: string;
    };

    @IsOptional()
    @IsBoolean()
    emailNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    smsNotifications?: boolean;

    @IsOptional()
    @IsString()
    currency?: string;
};

export class ChangePasswordRequestDto {
    @IsString()
    currentPassword: string;

    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
    newPassword: string;

    @IsString()
    confirmPassword: string;
}
