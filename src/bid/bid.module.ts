import { Module, forwardRef } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidResolver } from './bid.resolver';
import { Bid } from './entities/bid.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionModule } from '../auction/auction.module';
import UserModule from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    forwardRef(() => AuctionModule),
    UserModule,
  ],
  providers: [BidResolver, BidService],
  exports: [BidService],
})
export class BidModule {}
