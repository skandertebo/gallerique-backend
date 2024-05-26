import { Injectable } from '@nestjs/common';
import GenericService from '../generic/generic.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Subject } from 'rxjs';
import User from 'src/user/user.entity';

@Injectable()
export default class NotificationsService extends GenericService<
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput
> {
  eventSubject: Subject<CreateNotificationInput>;
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly userService: UserService,
  ) {
    super(notificationRepository);
    this.eventSubject = new Subject();
  }

  @OnEvent('NotificationEvent')
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

  @OnEvent('NotificationEvent')
  sendNotificationEvent(notificationPayload: CreateNotificationInput) {
    this.eventSubject.next(notificationPayload);
  }

  getNotificationStream() {
    return this.eventSubject.asObservable();
  }

  async findNotificationsByUser(
    user: User,
    page: number = 1,
    limit: number = 10,
  ): Promise<Notification[]> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .innerJoin('notification.users', 'user', 'user.id = :userId', {
        userId: user.id,
      })
      .orderBy('notification.createdAt', 'DESC');

    return this.paginate(queryBuilder, page, limit);
  }
}
