import { Injectable } from '@nestjs/common';
import GenericService from 'src/generic/generic.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
@Injectable()
export default class NotificationsService extends GenericService<
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput
> {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly userService: UserService,
  ) {
    super(notificationRepository);
  }

  async createNotification(
    createNotificationInput: CreateNotificationInput,
  ): Promise<Notification> {
    const users = await this.userService.findByIds(
      createNotificationInput.userIds,
    );
    const notification = this.notificationRepository.create({
      title: createNotificationInput.title,
      content: createNotificationInput.content,
      type: createNotificationInput.type,
      users: users,
    });
    const createdNotification =
      await this.notificationRepository.save(notification);
    return createdNotification;
  }
}
