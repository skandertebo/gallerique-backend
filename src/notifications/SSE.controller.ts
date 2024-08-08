import { Controller, Sse, UseGuards } from '@nestjs/common';
import { Observable, filter, map } from 'rxjs';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import User from 'src/user/user.entity';
import NotificationsService from './notifications.service';

@Controller('notifications')
export class SSEController {
  constructor(private readonly notificationService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Sse('listen')
  getEvents(@GetUser() user: User): Observable<any> {
    return this.notificationService.getNotificationStream().pipe(
      filter((notification) => notification.userIds.includes(user.id)),
      map((notification) => ({
        data: {
          content: notification.content,
          title: notification.title,
          type: notification.type,
        },
      })),
    );
  }
}
