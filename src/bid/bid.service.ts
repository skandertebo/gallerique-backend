import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Bid } from './entities/bid.entity';
import GenericService from '../generic/generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuctionService } from 'src/auction/auction.service';
import User from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BidService extends GenericService<Bid> {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuctionService))
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
    // Update the auction's current price
    const auction = await this.auctionService.findOne(auctionId);
    auction.currentPrice = bid.price;

    // Update the user's credit
    user.credit -= bid.price;

    // Save changes to the database
    await this.auctionService.save(auction);
    await this.userService.save(user);
  }
}
