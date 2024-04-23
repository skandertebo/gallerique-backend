import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { jwtSecret } from '../jwtConstants';
import User from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: Partial<Repository<User>>;
  let userService: UserService;
  let jwtService: JwtService;
  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn().mockImplementation((obj) => {
        return Promise.resolve(
          obj?.where?.email === 'alexandertebourb@gmail.com' ||
            obj.where?.id === 1
            ? {
                id: 1,
                email: obj.where.email,
                password: 'password',
                firstName: 'Alexander',
                lastName: 'Tebourbi',
                address: '123 Main St',
              }
            : null,
        );
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
    jwtService = module.get<JwtService>(JwtService);
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
    jest.spyOn(bcrypt, 'compare').mockImplementation((v1, v2) => v1 === v2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should provide a correct mock', async () => {
    const user = await userService.findOne(1);
    expect(user.password).toBe('password');
  });

  it('should validate a user', async () => {
    const user = await service.validateUser(
      'alexandertebourb@gmail.com',
      'password',
    );
    expect(user.id).toBe(1);
    expect(Object.keys(user)).not.toContain('password');
  });

  it('should throw an error if the email is incorrect', async () => {
    const resPromise = service.validateUser(
      'alexandertebourbi@gmail.com',
      'password',
    );
    await expect(resPromise).rejects.toThrow('Email is incorrect');
  });

  it('should throw an error if the password is incorrect', async () => {
    const resPromise = service.validateUser(
      'alexandertebourb@gmail.com',
      'passwordi',
    );
    await expect(resPromise).rejects.toThrow('Password is incorrect');
  });

  it('should login a user', async () => {
    const user = await userService.findOne(1);
    const res = await service.login(user);
    expect(res.access_token).toBe('token');
    expect(res.user.id).toBe(1);
  });

  it('should register a user', async () => {
    const res = await service.register({
      email: 'alexandertebourb',
      password: 'password',
      firstName: 'Alexander',
      lastName: 'Tebourbi',
      address: '123 Main St',
    });
    expect(res.access_token).toBe('token');
    expect(res.user.id).toBe(1);
  });
});
