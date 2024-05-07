import { Injectable } from '@nestjs/common';
import { Bid } from './entities/bid.entity';
import GenericService from '../generic/generic.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuctionService } from '../auction/auction.service';
import User from '../user/user.entity';
import { CreateBidInput } from './dto/create-bid.input';

@Injectable()
export class BidService extends GenericService<Bid> {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    private readonly auctionService: AuctionService,
  ) {
    super(bidRepository);
  }

  async bid(createBidInput: CreateBidInput, user: User): Promise<Bid> {
    const auction = await this.auctionService.findOne(createBidInput.auctionId);
    if (auction.status !== 'OPEN') {
      throw new Error('The auction is not open for bidding');
    }
    if (!auction.members.includes(user)) {
      throw new Error('You are not a member of this auction');
    }
    //check if the user has enough credit
    if (user.credit < createBidInput.price) {
      throw new Error('Not enough balance');
    }
    // Update the auction's current price
    if (createBidInput.price <= auction.currentPrice) {
      throw new Error('Bid price must be higher than the current price');
    }
    auction.currentPrice = createBidInput.price;
    // Save changes to the database
    await this.auctionService.save(auction);
    const bid = this.bidRepository.create({
      ...createBidInput,
      owner: user,
    });
    return this.bidRepository.save(bid);
  }

  async getByAuction(
    auctionId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<Bid[]> {
    const queryBuilder = this.bidRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.owner', 'owner')
      .where('bid.auctionId = :auctionId', { auctionId })
      .orderBy('bid.createdAt', 'ASC');

    return await this.paginate(queryBuilder, page, limit);
  }
}
