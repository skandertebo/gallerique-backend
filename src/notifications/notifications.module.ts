import NotificationsService from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { Module } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserModule from 'src/user/user.module';
import User from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User]), UserModule],
  providers: [NotificationsResolver, NotificationsService],
})
export class NotificationsModule {}
