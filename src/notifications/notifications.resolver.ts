import { Args, Mutation, Resolver } from '@nestjs/graphql';
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

  @Mutation(() => Notification)
  async createNotification(
    @Args('createNotificationInput')
    createNotificationInput: CreateNotificationInput,
  ) {
    return this.notificationsService.createNotification(
      createNotificationInput,
    );
  }
}
