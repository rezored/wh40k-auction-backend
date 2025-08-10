import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';

describe('NotificationsService', () => {
    let service: NotificationsService;
    let mockRepository: jest.Mocked<Repository<Notification>>;

    const mockNotification = {
        id: 'test-uuid',
        userId: 1,
        type: NotificationType.BID_PLACED,
        title: 'Test Notification',
        message: 'Test message',
        data: {},
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(async () => {
        const mockRepositoryMethods = {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: getRepositoryToken(Notification),
                    useValue: mockRepositoryMethods,
                },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
        mockRepository = module.get(getRepositoryToken(Notification));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createNotification', () => {
        it('should create a notification successfully', async () => {
            const createDto: CreateNotificationDto = {
                type: NotificationType.BID_PLACED,
                title: 'New Bid',
                message: 'Someone placed a bid',
                data: { auctionId: 1 }
            };

            mockRepository.create.mockReturnValue(mockNotification);
            mockRepository.save.mockResolvedValue(mockNotification);

            const result = await service.createNotification(1, createDto);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 1,
                ...createDto,
                data: createDto.data
            });
            expect(mockRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockNotification);
        });
    });

    describe('getUserNotifications', () => {
        it('should return notifications with pagination', async () => {
            const mockNotifications = [mockNotification];
            mockRepository.findAndCount.mockResolvedValue([mockNotifications, 1]);
            mockRepository.count.mockResolvedValue(5);

            const result = await service.getUserNotifications(1, { page: 1, limit: 10 });

            expect(mockRepository.findAndCount).toHaveBeenCalledWith({
                where: { userId: 1 },
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
            expect(result.notifications).toEqual(mockNotifications);
            expect(result.unreadCount).toBe(5);
        });

        it('should filter unread notifications when requested', async () => {
            mockRepository.findAndCount.mockResolvedValue([[], 0]);
            mockRepository.count.mockResolvedValue(0);

            await service.getUserNotifications(1, { unreadOnly: true });

            expect(mockRepository.findAndCount).toHaveBeenCalledWith({
                where: { userId: 1, isRead: false },
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 50
            });
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread count', async () => {
            mockRepository.count.mockResolvedValue(3);

            const result = await service.getUnreadCount(1);

            expect(mockRepository.count).toHaveBeenCalledWith({
                where: { userId: 1, isRead: false }
            });
            expect(result).toBe(3);
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            mockRepository.update.mockResolvedValue({ affected: 1 } as any);

            await service.markAsRead('test-uuid', 1);

            expect(mockRepository.update).toHaveBeenCalledWith(
                { id: 'test-uuid', userId: 1 },
                { isRead: true }
            );
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read', async () => {
            mockRepository.update.mockResolvedValue({ affected: 5 } as any);

            await service.markAllAsRead(1);

            expect(mockRepository.update).toHaveBeenCalledWith(
                { userId: 1, isRead: false },
                { isRead: true }
            );
        });
    });

    describe('deleteNotification', () => {
        it('should delete notification', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            await service.deleteNotification('test-uuid', 1);

            expect(mockRepository.delete).toHaveBeenCalledWith({
                id: 'test-uuid',
                userId: 1
            });
        });
    });

    describe('notification helper methods', () => {
        beforeEach(() => {
            mockRepository.create.mockReturnValue(mockNotification);
            mockRepository.save.mockResolvedValue(mockNotification);
        });

        it('should notify bid placed', async () => {
            await service.notifyBidPlaced(1, 'Test Auction', 100, 'John Doe', 1);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 1,
                type: NotificationType.BID_PLACED,
                title: 'New Bid Received',
                message: 'John Doe placed a bid of €100 on "Test Auction"',
                data: {
                    auctionId: 1,
                    auctionTitle: 'Test Auction',
                    bidAmount: 100,
                    bidderName: 'John Doe'
                }
            });
        });

        it('should notify bid outbid', async () => {
            await service.notifyBidOutbid(1, 'Test Auction', 100, 1);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 1,
                type: NotificationType.BID_OUTBID,
                title: 'You Have Been Outbid',
                message: 'Someone outbid you on "Test Auction"',
                data: {
                    auctionId: 1,
                    auctionTitle: 'Test Auction',
                    bidAmount: 100
                }
            });
        });

        it('should notify offer received', async () => {
            await service.notifyOfferReceived(1, 'Test Auction', 100, 'John Doe', 1);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 1,
                type: NotificationType.OFFER_RECEIVED,
                title: 'New Offer Received',
                message: 'John Doe made an offer of €100 on "Test Auction"',
                data: {
                    auctionId: 1,
                    auctionTitle: 'Test Auction',
                    offerAmount: 100,
                    offererName: 'John Doe'
                }
            });
        });

        it('should notify offer accepted', async () => {
            await service.notifyOfferAccepted(1, 'Test Auction', 100, 1);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 1,
                type: NotificationType.OFFER_ACCEPTED,
                title: 'Offer Accepted!',
                message: 'Your offer of €100 on "Test Auction" was accepted!',
                data: {
                    auctionId: 1,
                    auctionTitle: 'Test Auction',
                    offerAmount: 100
                }
            });
        });

        it('should notify offer rejected', async () => {
            await service.notifyOfferRejected(1, 'Test Auction', 100, 1);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 1,
                type: NotificationType.OFFER_REJECTED,
                title: 'Offer Rejected',
                message: 'Your offer of €100 on "Test Auction" was not accepted.',
                data: {
                    auctionId: 1,
                    auctionTitle: 'Test Auction',
                    offerAmount: 100
                }
            });
        });

        it('should notify auction won', async () => {
            await service.notifyAuctionWon(1, 'Test Auction', 100, 1);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 1,
                type: NotificationType.AUCTION_WON,
                title: 'Congratulations! You Won!',
                message: 'You won the auction "Test Auction" for €100',
                data: {
                    auctionId: 1,
                    auctionTitle: 'Test Auction',
                    finalPrice: 100
                }
            });
        });

        it('should notify auction ended', async () => {
            await service.notifyAuctionEnded(1, 'Test Auction', 1);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 1,
                type: NotificationType.AUCTION_ENDED,
                title: 'Auction Ended',
                message: 'Your auction "Test Auction" has ended',
                data: {
                    auctionId: 1,
                    auctionTitle: 'Test Auction'
                }
            });
        });
    });
});
