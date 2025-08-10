import { IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../notification.entity';
import { UserAddress } from '../../user/user-address.entity';

export class NotificationResponseDto {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    auctionId?: number;
    offerId?: number;
    recipientId: number;
    senderId?: number;
    isRead: boolean;
    createdAt: Date;
    metadata?: {
        winnerAddress?: UserAddress;
        finalPrice?: number;
        shippingInfo?: any;
    };
}

export class NotificationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsBoolean()
    unreadOnly?: boolean;
}

export class NotificationListResponseDto {
    notifications: NotificationResponseDto[];
    total: number;
    unreadCount: number;
}

export class WinnerNotificationDataDto {
    winnerId: number;
    winnerAddress: UserAddress;
    finalPrice: number;
    auctionTitle: string;
    message?: string;
}

export class OfferAcceptanceDataDto {
    buyerId: number;
    buyerAddress: UserAddress;
    offerAmount: number;
    auctionTitle: string;
    message?: string;
}
