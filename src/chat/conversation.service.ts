import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import GenericService from '../generic/generic.service';
import User from '../user/user.entity';
import Conversation, { ConversationType } from './entities/conversation.entity';

@Injectable()
export class ConversationService extends GenericService<Conversation> {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {
    super(conversationRepository);
  }

  async createNormalConversation(users: User[]) {
    return await this.conversationRepository.save({
      type: ConversationType.NORMAL,
      users: users,
    });
  }
  //TODO: create auction conversation
}
