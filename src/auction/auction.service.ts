import { Injectable } from '@nestjs/common';
import GenericService from '../generic/generic.service';
import { Auction } from './entities/auction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuctionService extends GenericService<Auction> {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
  ) {
    super(auctionRepository);
  }
}
