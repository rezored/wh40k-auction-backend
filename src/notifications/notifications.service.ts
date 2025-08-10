import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { NotificationResponseDto, NotificationListResponseDto, WinnerNotificationDataDto, OfferAcceptanceDataDto } from './dto/notification.dto';
import { UserAddress } from '../user/user-address.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) { }

    async getUserNotifications(
        userId: number,
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false
    ): Promise<NotificationListResponseDto> {
        const queryBuilder = this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.recipientId = :userId', { userId });

        if (unreadOnly) {
            queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
        }

        const [notifications, total] = await queryBuilder
            .orderBy('notification.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const unreadCount = await this.getUnreadCount(userId);

        return {
            notifications: notifications.map(this.mapToResponseDto),
            total,
            unreadCount
        };
    }

    async markNotificationAsRead(userId: number, notificationId: number): Promise<{ message: string }> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, recipientId: userId }
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        notification.isRead = true;
        await this.notificationRepository.save(notification);

        return { message: 'Notification marked as read' };
    }

    async markAllNotificationsAsRead(userId: number): Promise<{ message: string }> {
        await this.notificationRepository.update(
            { recipientId: userId, isRead: false },
            { isRead: true }
        );

        return { message: 'All notifications marked as read' };
    }

    async deleteNotification(userId: number, notificationId: number): Promise<{ message: string }> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, recipientId: userId }
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        await this.notificationRepository.remove(notification);
        return { message: 'Notification deleted successfully' };
    }

    async getUnreadCount(userId: number): Promise<number> {
        return this.notificationRepository.count({
            where: { recipientId: userId, isRead: false }
        });
    }

    async createNotification(
        type: NotificationType,
        title: string,
        message: string,
        recipientId: number,
        senderId?: number,
        auctionId?: number,
        offerId?: number,
        metadata?: any
    ): Promise<Notification> {
        const notification = this.notificationRepository.create({
            type,
            title,
            message,
            recipientId,
            senderId,
            auctionId,
            offerId,
            metadata
        });

        return this.notificationRepository.save(notification);
    }

    async notifyAuctionWinner(
        auctionId: number,
        winnerData: WinnerNotificationDataDto
    ): Promise<Notification> {
        const title = `Congratulations! You won "${winnerData.auctionTitle}"`;
        const message = winnerData.message ||
            `You won the auction "${winnerData.auctionTitle}" for $${winnerData.finalPrice}. Please check your email for shipping details.`;

        return this.createNotification(
            NotificationType.AUCTION_WON,
            title,
            message,
            winnerData.winnerId,
            undefined,
            auctionId,
            undefined,
            {
                winnerAddress: winnerData.winnerAddress,
                finalPrice: winnerData.finalPrice
            }
        );
    }

    async notifyOfferAccepted(
        offerId: number,
        acceptanceData: OfferAcceptanceDataDto
    ): Promise<Notification> {
        const title = `Offer Accepted for "${acceptanceData.auctionTitle}"`;
        const message = acceptanceData.message ||
            `Your offer of $${acceptanceData.offerAmount} for "${acceptanceData.auctionTitle}" has been accepted. Please check your email for shipping details.`;

        return this.createNotification(
            NotificationType.OFFER_ACCEPTED,
            title,
            message,
            acceptanceData.buyerId,
            undefined,
            undefined,
            offerId,
            {
                buyerAddress: acceptanceData.buyerAddress,
                offerAmount: acceptanceData.offerAmount
            }
        );
    }

    async notifyBidOutbid(
        auctionId: number,
        outbidUserId: number,
        auctionTitle: string,
        newHighestBid: number
    ): Promise<Notification> {
        const title = `You've been outbid on "${auctionTitle}"`;
        const message = `Someone has placed a higher bid of $${newHighestBid} on "${auctionTitle}". Place a new bid to stay in the running!`;

        return this.createNotification(
            NotificationType.BID_OUTBID,
            title,
            message,
            outbidUserId,
            undefined,
            auctionId,
            undefined,
            { newHighestBid }
        );
    }

    async notifyAuctionEnding(
        auctionId: number,
        userId: number,
        auctionTitle: string,
        hoursLeft: number
    ): Promise<Notification> {
        const title = `Auction ending soon: "${auctionTitle}"`;
        const message = `The auction "${auctionTitle}" ends in ${hoursLeft} hours. Don't miss out!`;

        return this.createNotification(
            NotificationType.AUCTION_ENDING,
            title,
            message,
            userId,
            undefined,
            auctionId
        );
    }

    private mapToResponseDto(notification: Notification): NotificationResponseDto {
        return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            auctionId: notification.auctionId,
            offerId: notification.offerId,
            recipientId: notification.recipientId,
            senderId: notification.senderId,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            metadata: notification.metadata
        };
    }
}
