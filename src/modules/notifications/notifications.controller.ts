import { Controller, Get, Patch, Post, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService, Recipient } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const recipientOf = (req: any): Recipient => ({
  name: req.user?.name || 'Unknown',
  scope: req.user?.scope,
  isSuperAdmin: req.user?.isSuperAdmin,
});

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@Req() req: any) {
    return this.notifications.list(recipientOf(req));
  }

  @Get('unread-count')
  async unread(@Req() req: any) {
    return { count: await this.notifications.unreadCount(recipientOf(req)) };
  }

  @Patch(':id/read')
  read(@Param('id') id: string) {
    return this.notifications.markRead(id);
  }

  @Post('read-all')
  readAll(@Req() req: any) {
    return this.notifications.markAllRead(recipientOf(req));
  }
}
