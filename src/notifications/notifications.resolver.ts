import { Args, Resolver, Query, Int } from '@nestjs/graphql';
import { Notification } from './entities/notification.entity';
import NotificationsService from './notifications.service';
import { BaseResolver } from '../generic/generic.resolver';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { Type, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators/getUser.decorator';
import User from 'src/user/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Notification)
export class NotificationsResolver extends BaseResolver(
  Notification as Type<Notification> & Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
) {
  constructor(private notificationsService: NotificationsService) {
    super(notificationsService);
  }

  @Query(() => [Notification], { name: 'notificationsOfUser' })
  async getNotificationsByUser(
    @Args('limit', { type: () => Int, defaultValue: 10 })
    limit: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @GetUser() user: User,
  ): Promise<Notification[]> {
    return this.notificationsService.findNotificationsByUser(user, page, limit);
  }
}
