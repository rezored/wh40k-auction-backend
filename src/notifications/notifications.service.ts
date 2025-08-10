import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import {
    CreateNotificationDto,
    GetNotificationsQuery,
    NotificationResponse,
    NotificationData
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>
    ) { }

    async createNotification(userId: number, data: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationRepository.create({
            userId,
            ...data,
            data: data.data || {}
        });
        return await this.notificationRepository.save(notification);
    }

    async getUserNotifications(userId: number, query: GetNotificationsQuery = {}): Promise<NotificationResponse> {
        const { page = 1, limit = 50, unreadOnly = false } = query;
        const skip = (page - 1) * limit;

        const whereClause: any = { userId };
        if (unreadOnly) {
            whereClause.isRead = false;
        }

        const [notifications, total] = await this.notificationRepository.findAndCount({
            where: whereClause,
            order: { createdAt: 'DESC' },
            skip,
            take: limit
        });

        const unreadCount = await this.getUnreadCount(userId);

        return {
            notifications,
            unreadCount
        };
    }

    async getUnreadCount(userId: number): Promise<number> {
        return await this.notificationRepository.count({
            where: { userId, isRead: false }
        });
    }

    async markAsRead(notificationId: string, userId: number): Promise<void> {
        await this.notificationRepository.update(
            { id: notificationId, userId },
            { isRead: true }
        );
    }

    async markAllAsRead(userId: number): Promise<void> {
        await this.notificationRepository.update(
            { userId, isRead: false },
            { isRead: true }
        );
    }

    async deleteNotification(notificationId: string, userId: number): Promise<void> {
        await this.notificationRepository.delete({ id: notificationId, userId });
    }

    // Helper methods for specific notification types
    async notifyBidPlaced(auctionOwnerId: number, auctionTitle: string, bidAmount: number, bidderName: string, auctionId: number): Promise<void> {
        await this.createNotification(auctionOwnerId, {
            type: NotificationType.BID_PLACED,
            title: 'New Bid Received',
            message: `${bidderName} placed a bid of €${bidAmount} on "${auctionTitle}"`,
            data: {
                auctionId,
                auctionTitle,
                bidAmount,
                bidderName
            }
        });
    }

    async notifyBidOutbid(userId: number, auctionTitle: string, bidAmount: number, auctionId: number): Promise<void> {
        await this.createNotification(userId, {
            type: NotificationType.BID_OUTBID,
            title: 'You Have Been Outbid',
            message: `Someone outbid you on "${auctionTitle}"`,
            data: {
                auctionId,
                auctionTitle,
                bidAmount
            }
        });
    }

    async notifyOfferReceived(auctionOwnerId: number, auctionTitle: string, offerAmount: number, offererName: string, auctionId: number): Promise<void> {
        await this.createNotification(auctionOwnerId, {
            type: NotificationType.OFFER_RECEIVED,
            title: 'New Offer Received',
            message: `${offererName} made an offer of €${offerAmount} on "${auctionTitle}"`,
            data: {
                auctionId,
                auctionTitle,
                offerAmount,
                offererName
            }
        });
    }

    async notifyOfferAccepted(offererId: number, auctionTitle: string, offerAmount: number, auctionId: number): Promise<void> {
        await this.createNotification(offererId, {
            type: NotificationType.OFFER_ACCEPTED,
            title: 'Offer Accepted!',
            message: `Your offer of €${offerAmount} on "${auctionTitle}" was accepted!`,
            data: {
                auctionId,
                auctionTitle,
                offerAmount
            }
        });
    }

    async notifyOfferRejected(offererId: number, auctionTitle: string, offerAmount: number, auctionId: number): Promise<void> {
        await this.createNotification(offererId, {
            type: NotificationType.OFFER_REJECTED,
            title: 'Offer Rejected',
            message: `Your offer of €${offerAmount} on "${auctionTitle}" was not accepted.`,
            data: {
                auctionId,
                auctionTitle,
                offerAmount
            }
        });
    }

    async notifyOfferExpired(offererId: number, auctionTitle: string, offerAmount: number, auctionId: number): Promise<void> {
        await this.createNotification(offererId, {
            type: NotificationType.OFFER_EXPIRED,
            title: 'Offer Expired',
            message: `Your offer of €${offerAmount} on "${auctionTitle}" has expired.`,
            data: {
                auctionId,
                auctionTitle,
                offerAmount
            }
        });
    }

    async notifyAuctionWon(winnerId: number, auctionTitle: string, finalPrice: number, auctionId: number): Promise<void> {
        await this.createNotification(winnerId, {
            type: NotificationType.AUCTION_WON,
            title: 'Congratulations! You Won!',
            message: `You won the auction "${auctionTitle}" for €${finalPrice}`,
            data: {
                auctionId,
                auctionTitle,
                finalPrice
            }
        });
    }

    async notifyAuctionEnded(auctionOwnerId: number, auctionTitle: string, auctionId: number): Promise<void> {
        await this.createNotification(auctionOwnerId, {
            type: NotificationType.AUCTION_ENDED,
            title: 'Auction Ended',
            message: `Your auction "${auctionTitle}" has ended`,
            data: {
                auctionId,
                auctionTitle
            }
        });
    }
}
