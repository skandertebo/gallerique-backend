import { Args, Resolver, Query, Int } from '@nestjs/graphql';
import { Notification } from './entities/notification.entity';
import NotificationsService from './notifications.service';
import { BaseResolver } from '../generic/generic.resolver';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { Type } from '@nestjs/common';
@Resolver(() => Notification)
export class NotificationsResolver extends BaseResolver(
  Notification as Type<Notification> & Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
) {
  constructor(private notificationsService: NotificationsService) {
    super(notificationsService);
  }

  @Query(() => [Notification], { name: 'getNotificationsByUser' })
  async getNotificationsByUser(
    @Args('userId') userId: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
  ): Promise<Notification[]> {
    return this.notificationsService.findNotificationsByUser(
      userId,
      page,
      limit,
    );
  }
}
