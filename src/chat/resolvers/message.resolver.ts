import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MessageService } from '../message.service';
import Message from '../entities/message.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import User from 'src/user/user.entity';
import createMessageDTO from '../dto/createMessage.dto';

@Resolver()
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}
  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard)
  async createMessage(
    @GetUser() user: User,
    @Args('createMessageInput') createMessageInput: createMessageDTO,
  ) {
    return await this.messageService.createMessage(createMessageInput, user);
  }
  @Query(() => [Message])
  async getMessagesByConversation(
    @Args('conversationID') conversationId: number,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
  ) {
    return this.messageService.getByConversation(conversationId, page, limit);
  }
}
