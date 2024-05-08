import { Test, TestingModule } from '@nestjs/testing';
import User, { UserStatus } from './user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

describe('UserResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const someUser: User = {
      address: 'Avenida Paulista',
      credit: 0,
      email: 'alexandertebourb@gmail.com',
      firstName: 'Alexander',
      id: 1,
      lastName: 'Tebo',
      status: UserStatus.VERIFIED,
      password: '123456',
      conversations: null,
      auctions: null,
      bids: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      wonAuctions: null,
      auctionsParticipated: null,
      notifications: null,
      payments: null,
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn().mockReturnValue([someUser] as User[]),
            findOne: jest.fn().mockImplementation((id: number) => ({
              ...someUser,
              id,
            })),
          },
        },
        UserResolver,
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
