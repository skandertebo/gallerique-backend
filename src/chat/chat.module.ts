import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserModule from '../user/user.module';
import { ConversationService } from './conversation.service';
import Conversation from './entities/conversation.entity';
import Message from './entities/message.entity';
import { MessageService } from './message.service';
import { ConversationResolver } from './resolvers/conversation.resolver';
import { MessageResolver } from './resolvers/message.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation]), UserModule],
  providers: [
    ConversationService,
    MessageService,
    MessageResolver,
    ConversationResolver,
  ],
  exports: [
    ConversationService,
    MessageService,
    MessageResolver,
    ConversationResolver,
  ],
})
export class ChatModule {}
