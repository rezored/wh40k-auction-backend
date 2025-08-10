import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class AddAddressRequestDto {
    @IsString()
    @MaxLength(255)
    street: string;

    @IsString()
    @MaxLength(100)
    city: string;

    @IsString()
    @MaxLength(100)
    state: string;

    @IsString()
    @MaxLength(20)
    postalCode: string;

    @IsString()
    @MaxLength(100)
    country: string;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}

export class UpdateAddressRequestDto {
    @IsString()
    @MaxLength(255)
    street: string;

    @IsString()
    @MaxLength(100)
    city: string;

    @IsString()
    @MaxLength(100)
    state: string;

    @IsString()
    @MaxLength(20)
    postalCode: string;

    @IsString()
    @MaxLength(100)
    country: string;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
