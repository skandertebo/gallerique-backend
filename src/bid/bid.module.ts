import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidResolver } from './bid.resolver';
import { Bid } from './entities/bid.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Bid])],
  providers: [BidResolver, BidService],
  exports: [BidService],
})
export class BidModule {}
