import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AzureStorageModule } from '@nestjs/azure-storage';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import Conversation from './chat/entities/conversation.entity';
import Message from './chat/entities/message.entity';
import HelloWorldModule from './hello-world/hello-world.module';
import { Notification } from './notifications/entities/notification.entity';
import { NotificationsModule } from './notifications/notifications.module';
import User from './user/user.entity';
import UserModule from './user/user.module';
dotenv.config();
@Module({
  imports: [
    HelloWorldModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
      playground: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Notification, Message, Conversation],
      synchronize: true,
    }),
    AzureStorageModule.withConfig({
      sasKey: process.env.AZURE_STORAGE_SAS_KEY,
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
    }),
    UserModule,
    AuthModule,
    NotificationsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
