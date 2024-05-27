import { Controller, Sse, UseGuards } from '@nestjs/common';
import { Observable, filter, map } from 'rxjs';
import NotificationsService from './notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import User from 'src/user/user.entity';

@Controller('notifications')
export class SSEController {
  constructor(private readonly notificationService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Sse('listen')
  getEvents(@GetUser() user: User): Observable<any> {
    return this.notificationService.getNotificationStream().pipe(
      filter((Notification) => Notification.userIds.includes(user.id)),
      map((Notification) => ({
        data: {
          content: Notification.content,
          title: Notification.title,
          type: Notification.type,
        },
      })),
    );
  }
}
