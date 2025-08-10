import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UploadedImageDto {
    @IsString()
    filename: string;

    @IsString()
    originalFilename: string;

    @IsString()
    url: string;

    @IsString()
    thumbnailUrl: string;

    @IsNumber()
    fileSize: number;

    @IsString()
    mimeType: string;

    @IsNumber()
    width: number;

    @IsNumber()
    height: number;

    @IsOptional()
    @IsString()
    altText?: string;

    @IsOptional()
    @IsBoolean()
    isMain?: boolean;
}

export class ImageUploadResponseDto {
    @IsString()
    message: string;

    @IsNumber()
    count: number;

    @IsString()
    uploadId: string;

    images: UploadedImageDto[];
}

export class ImageReorderDto {
    @IsNumber()
    imageId: number;

    @IsNumber()
    newOrder: number;
}

export class ImageReorderRequestDto {
    @IsString()
    message: string;

    images: ImageReorderDto[];
}
