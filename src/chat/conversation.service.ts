import { Injectable } from '@nestjs/common';
import GenericService from 'src/generic/generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Conversation, { ConversationType } from './entities/conversation.entity';
import User from 'src/user/user.entity';

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
