import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import GenericService from '../generic/generic.service';
import User from './user.entity';

@Injectable()
export class UserService extends GenericService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async getUserConversations(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['conversations'],
    });
    return user.conversations;
  }
  async updateUserCredit(userId: number, credit: number) {
    return this.userRepository.update({ id: userId }, { credit });
  }
}
