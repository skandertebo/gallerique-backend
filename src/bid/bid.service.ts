import { Injectable } from '@nestjs/common';
import { Bid } from './entities/bid.entity';
import GenericService from '../generic/generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BidService extends GenericService<Bid> {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
  ) {
    super(bidRepository);
  }

  getBidByPrice(price: number) {
    this.bidRepository.find({ where: { price } });
  }
}
