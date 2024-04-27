import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionResolver } from './auction.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from './entities/auction.entity';
import { BidModule } from '../bid/bid.module';

@Module({
  imports: [TypeOrmModule.forFeature([Auction]), BidModule],
  providers: [AuctionResolver, AuctionService],
})
export class AuctionModule {}
