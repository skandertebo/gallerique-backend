import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionResolver } from './auction.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from './entities/auction.entity';
import { BidService } from './bid.service';
import UserModule from 'src/user/user.module';
import { Bid } from './entities/bid.entity';

import { ChatModule } from 'src/chat/chat.module';
import { SchedulerModule } from 'src/Scheduler/scheduler.module';
import { FileModule } from 'src/File/file.module';
import { MutexManagerModule } from 'src/mutex-manager/mutex-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Bid]),
    UserModule,
    ChatModule,
    SchedulerModule,
    FileModule,
    MutexManagerModule,
  ],
  providers: [AuctionResolver, AuctionService, BidService],
  exports: [AuctionService, BidService],
})
export class AuctionModule {}
