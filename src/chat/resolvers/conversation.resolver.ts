import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { ConversationService } from '../conversation.service';
import Conversation from '../entities/conversation.entity';
import Message from '../entities/message.entity';
import { MessageService } from '../message.service';

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
    @Args('limit', { nullable: true, defaultValue: 1000 }) limit: number,
    @Args('page', { nullable: true, defaultValue: 1 }) page: number,
  ): Promise<Message[]> {
    return await this.messageService.getByConversation(
      conversation.id,
      page,
      limit,
    );
  }
}
