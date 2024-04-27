import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Notification } from './entities/notification.entity';
import NotificationsService from './notifications.service';
import { BaseResolver } from '../generic/generic.resolver';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
@Resolver(() => Notification)
export class NotificationsResolver extends BaseResolver(
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
) {
  constructor(private notificationsService: NotificationsService) {
    super(Notification, NotificationsService);
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
