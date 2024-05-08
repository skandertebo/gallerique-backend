import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AzureStorageModule } from '@nestjs/azure-storage';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import Payment from './payment/payment.entity';
import { PaymentModule } from './payment/payment.module';
import { StripeModule } from './stripe/stripe.module';
import User from './user/user.entity';
import UserModule from './user/user.module';
import { WebSocketManagerGateway } from './websocket-manager/websocket.gateway';

import { AuctionModule } from './auction/auction.module';
import { Auction } from './auction/entities/auction.entity';
import { Bid } from './auction/entities/bid.entity';
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
      entities: [
        User,
        Notification,
        Message,
        Conversation,
        Bid,
        Auction,
        Payment,
      ],
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
    StripeModule,
    PaymentModule,
    ConfigModule.forRoot(),
    AuctionModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, WebSocketManagerGateway],
})
export class AppModule {}
