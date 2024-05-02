import { Inject, Injectable, forwardRef } from '@nestjs/common';
import GenericService from '../generic/generic.service';
import { Auction } from './entities/auction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BidService } from 'src/bid/bid.service';

@Injectable()
export class AuctionService extends GenericService<Auction> {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @Inject(forwardRef(() => BidService))
    private readonly bidService: BidService,
  ) {
    super(auctionRepository);
  }
}
