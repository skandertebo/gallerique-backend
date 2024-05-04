import * as dotenv from 'dotenv';
import {
  Repository,
  createConnection,
  getConnection,
  getRepository,
} from 'typeorm';
import Conversation from '../chat/entities/conversation.entity';
import Message from '../chat/entities/message.entity';
import User from './user.entity';
import { UserService } from './user.service';
import { Auction } from '../auction/entities/auction.entity';
import { Bid } from '../auction/entities/bid.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('iconv-lite').encodingExists('foo');

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  beforeAll(() => {
    dotenv.config();
  });

  beforeEach(async () => {
    const connection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [User, Conversation, Message, Auction, Bid],
      synchronize: true,
      logging: false,
      name: 'test-connection',
    });
    repository = getRepository(User, 'test-connection');
    service = new UserService(repository);
    return connection;
  });

  afterEach(async () => {
    await getConnection('test-connection').close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of users', async () => {
    expect(await service.findAll()).toBeInstanceOf(Array);
  });

  it('should create a new user and return it', async () => {
    const user = await service.create({
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      email: 'johndoe@gmail.com',
      password: '12345678',
    });
    expect(user).toHaveProperty('id');
    const id = user.id;
    expect(service.findOne(id)).resolves.toEqual(user);
  });

  it('should update a user and return it', async () => {
    const user = await service.create({
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      email: 'messi123@gmail.com',
      password: '12345678',
    });
    const id = user.id;
    await service.update(id, {
      firstName: 'Lionel',
      lastName: 'Messi',
      address: '456 Main St',
    });
    const updatedUser = await service.findOne(id);
    expect({
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      address: updatedUser.address,
      email: updatedUser.email,
    }).toEqual({
      firstName: 'Lionel',
      lastName: 'Messi',
      address: '456 Main St',
      email: 'messi123@gmail.com',
    });
  });
});
