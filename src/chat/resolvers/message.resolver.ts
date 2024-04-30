import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetUser } from '../../auth/decorators/getUser.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwtAuth.guard';
import User from '../../user/user.entity';
import createMessageDTO from '../dto/createMessage.dto';
import Message from '../entities/message.entity';
import { MessageService } from '../message.service';

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
