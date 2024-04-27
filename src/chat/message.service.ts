import { Injectable } from '@nestjs/common';
import GenericService from 'src/generic/generic.service';
import Message from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationService } from './conversation.service';
import User from 'src/user/user.entity';
import createMessageDTO from './dto/createMessage.dto';

@Injectable()
export class MessageService extends GenericService<Message> {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly conversationService: ConversationService,
  ) {
    super(messageRepository);
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
      .orderBy('message.createdAt', 'ASC');

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