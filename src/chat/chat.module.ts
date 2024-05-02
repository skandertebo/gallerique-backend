import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Message from './entities/message.entity';
import Conversation from './entities/conversation.entity';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { MessageResolver } from './resolvers/message.resolver';
import { ConversationResolver } from './resolvers/conversation.resolver';
import UserModule from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation]), UserModule],
  providers: [
    ConversationService,
    MessageService,
    MessageResolver,
    ConversationResolver,
  ],
  exports: [],
})
export class ChatModule {}
