import { Injectable } from '@nestjs/common';
import { Bid } from './entities/bid.entity';
import GenericService from '../generic/generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuctionService } from 'src/auction/auction.service';
import User from 'src/user/user.entity';

@Injectable()
export class BidService extends GenericService<Bid> {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    private readonly auctionService: AuctionService,
  ) {
    super(bidRepository);
  }

  getBidByPrice(price: number) {
    this.bidRepository.find({ where: { price } });
  }

  async addBidToAuction(
    bid: Partial<Bid>,
    auctionId: number,
    user: User,
  ): Promise<void> {
    //check if the user has enough credit
    if (user.credit < bid.price) {
      throw new Error('Not enough balance');
    }
    // Update the auction's current price
    const auction = await this.auctionService.findOne(auctionId);
    if (bid.price <= auction.currentPrice) {
      throw new Error('Bid price must be higher than the current price');
    }
    auction.currentPrice = bid.price;
    // Save changes to the database
    await this.auctionService.save(auction);
  }
}
