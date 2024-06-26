import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import GenericServiceWithObservable from 'src/generic/genericWithObservable.service';
import { Repository } from 'typeorm';
import User from '../user/user.entity';
import { ConversationService } from './conversation.service';
import createMessageDTO from './dto/createMessage.dto';
import Message from './entities/message.entity';

@Injectable()
export class MessageService extends GenericServiceWithObservable<Message> {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly conversationService: ConversationService,
  ) {
    super(messageRepository);
    this.scope = 'message';
  }
  async getByConversation(
    conversationId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<Message[]> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender') // Assuming 'sender' is a relation in your Message entity
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC');

    return await this.paginate(queryBuilder, page, limit);
  }

  async createMessage(
    { conversationId, content }: createMessageDTO,
    user: User,
  ) {
    //TODO: Check if the conversation is an auction conversation
    const conversation = await this.conversationService.findOne(conversationId);
    return await this.create({
      sender: user,
      content: content,
      conversation: conversation,
    });
  }
}
