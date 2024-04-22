import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { jwtSecret } from '../jwtConstants';
import User from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: Partial<Repository<User>>;
  let userService: UserService;
  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        email: 'alexandertebourb@gmail.com',
        password: 'password',
        firstName: 'Alexander',
        lastName: 'Tebourbi',
        address: '123 Main St',
      }),
      create: jest.fn().mockResolvedValue({
        id: 1,
        email: 'alexandertebourb@gmail.com',
        password: 'password',
        firstName: 'Alexander',
        lastName: 'Tebourbi',
        address: '123 Main St',
      }),
      update: jest
        .fn()
        .mockImplementation((user: User) => Promise.resolve(user)),
      save: jest.fn().mockImplementation((user: User) => Promise.resolve(user)),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: jwtSecret,
          signOptions: { expiresIn: '60m' },
        }),
      ],
      providers: [
        UserService,
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should provide a correct mock', async () => {
    const user = await userService.findOne(1);
    expect(user.password).toBe('password');
  });
});
