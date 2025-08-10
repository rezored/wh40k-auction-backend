import { NotificationType } from '../notification.entity';

export interface NotificationData {
    auctionId?: number;
    auctionTitle?: string;
    bidAmount?: number;
    offerAmount?: number;
    bidderName?: string;
    offererName?: string;
    winnerAddress?: any;
    finalPrice?: number;
    shippingInfo?: any;
}

export interface CreateNotificationDto {
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
}

export interface NotificationResponse {
    notifications: any[];
    unreadCount: number;
}

export interface GetNotificationsQuery {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}

export interface UnreadCountResponse {
    count: number;
}

export interface MarkAsReadResponse {
    success: boolean;
}

export interface MarkAllAsReadResponse {
    success: boolean;
}

export interface DeleteNotificationResponse {
    success: boolean;
}

export interface CreateNotificationResponse {
    notification: any;
}
