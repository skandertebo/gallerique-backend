import User from 'src/user/user.entity';

const mockUserRepository = {
  findOne: jest.fn().mockImplementation((obj) => {
    return Promise.resolve(
      obj?.where?.email === 'alexandertebourb@gmail.com' || obj.where?.id === 1
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
  update: jest.fn().mockImplementation((user: User) => Promise.resolve(user)),
  save: jest.fn().mockImplementation((user: User) => Promise.resolve(user)),
};

export default mockUserRepository;
