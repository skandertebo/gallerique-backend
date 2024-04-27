import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BidModule } from './bid/bid.module';
import { AuctionModule } from './auction/auction.module';
import HelloWorldModule from './hello-world/hello-world.module';
import User from './user/user.entity';
import UserModule from './user/user.module';
dotenv.config();
@Module({
  imports: [
    HelloWorldModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'amina2003',
      database: 'gallerique',
      entities: [User],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    BidModule,
    AuctionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
