import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import Conversation from '../entities/conversation.entity';
import { ConversationService } from '../conversation.service';
import { MessageService } from '../message.service';
import Message from '../entities/message.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';

@Resolver(() => Conversation)
export class ConversationResolver {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => Conversation)
  async getConversation(@Args('id') id: number): Promise<Conversation> {
    const conversation = await this.conversationService.findOne(id);
    return conversation;
  }

  @ResolveField()
  async messages(
    @Parent() conversation: Conversation,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<Message[]> {
    return await this.messageService.getByConversation(
      conversation.id,
      1,
      limit,
    );
  }
}
