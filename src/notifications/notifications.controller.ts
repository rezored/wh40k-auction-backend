import { Controller, Get, Put, Delete, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type {
    GetNotificationsQuery,
    NotificationResponse,
    UnreadCountResponse,
    MarkAsReadResponse,
    MarkAllAsReadResponse,
    DeleteNotificationResponse
} from './dto/notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(
        @Req() req,
        @Query() query: GetNotificationsQuery
    ): Promise<NotificationResponse> {
        return await this.notificationsService.getUserNotifications(req.user.id, query);
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req): Promise<UnreadCountResponse> {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return { count };
    }

    @Put(':id/read')
    async markAsRead(
        @Param('id') id: string,
        @Req() req
    ): Promise<MarkAsReadResponse> {
        await this.notificationsService.markAsRead(id, req.user.id);
        return { success: true };
    }

    @Put('mark-all-read')
    async markAllAsRead(@Req() req): Promise<MarkAllAsReadResponse> {
        await this.notificationsService.markAllAsRead(req.user.id);
        return { success: true };
    }

    @Delete(':id')
    async deleteNotification(
        @Param('id') id: string,
        @Req() req
    ): Promise<DeleteNotificationResponse> {
        await this.notificationsService.deleteNotification(id, req.user.id);
        return { success: true };
    }
}
