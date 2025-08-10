import { Controller, Get, Put, Delete, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { NotificationQueryDto, NotificationListResponseDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUserNotifications(
        @Request() req,
        @Query() query: NotificationQueryDto
    ): Promise<NotificationListResponseDto> {
        return this.notificationsService.getUserNotifications(
            req.user.id,
            query.page,
            query.limit,
            query.unreadOnly
        );
    }

    @Put(':notificationId/read')
    @UseGuards(JwtAuthGuard)
    async markNotificationAsRead(
        @Request() req,
        @Param('notificationId', ParseIntPipe) notificationId: number
    ): Promise<{ message: string }> {
        return this.notificationsService.markNotificationAsRead(req.user.id, notificationId);
    }

    @Put('read-all')
    @UseGuards(JwtAuthGuard)
    async markAllNotificationsAsRead(@Request() req): Promise<{ message: string }> {
        return this.notificationsService.markAllNotificationsAsRead(req.user.id);
    }

    @Delete(':notificationId')
    @UseGuards(JwtAuthGuard)
    async deleteNotification(
        @Request() req,
        @Param('notificationId', ParseIntPipe) notificationId: number
    ): Promise<{ message: string }> {
        return this.notificationsService.deleteNotification(req.user.id, notificationId);
    }

    @Get('unread-count')
    @UseGuards(JwtAuthGuard)
    async getUnreadCount(@Request() req): Promise<{ count: number }> {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return { count };
    }
}
