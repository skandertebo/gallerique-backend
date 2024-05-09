import { Test, TestingModule } from '@nestjs/testing';
import NotificationsService from './notifications.service';
import { Subject } from 'rxjs';
import { CreateNotificationInput } from './dto/create-notification.input';
import { Notification } from './entities/notification.entity';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let eventSubject: Subject<CreateNotificationInput>;
  let mockUserService: Partial<UserService>;
  let mockNotificationRepository: Partial<Repository<Notification>>;

  beforeEach(async () => {
    mockUserService = {
      findByIds: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]),
    };

    mockNotificationRepository = {
      create: jest.fn().mockImplementation((notification) => notification),
      save: jest.fn().mockImplementation(async (notification) => ({
        ...notification,
        id: Date.now(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    eventSubject = service.eventSubject;
  });

  it('should add event to the stream', (done) => {
    const notificationPayload: CreateNotificationInput = {
      title: 'Test Notification',
      content: 'This is a test notification',
      type: 'info',
      userIds: [1, 2, 3],
    };

    const subscription = eventSubject.subscribe((data) => {
      expect(data).toEqual(notificationPayload);
      subscription.unsubscribe();
      done();
    });
    service.sendNotificationEvent(notificationPayload);
  });
});
