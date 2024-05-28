import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerService } from 'src/Scheduler/scheduler.service';
import GenericServiceWithObservable from 'src/generic/genericWithObservable.service';
import { Repository } from 'typeorm';
import { AuctionService } from '../auction/auction.service';
import { MutexService } from '../mutex-manager/mutex-manager.service';
import User from '../user/user.entity';
import { CreateBidInput } from './dto/create-bid.input';
import { Bid } from './entities/bid.entity';

@Injectable()
export class BidService extends GenericServiceWithObservable<Bid> {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    private readonly auctionService: AuctionService,
    private readonly mutexService: MutexService,
    private readonly scheduler: SchedulerService,
  ) {
    super(bidRepository);
  }

  async bid(createBidInput: CreateBidInput, user: User): Promise<Bid> {
    const release = await this.mutexService.lock(createBidInput.auctionId);
    try {
      return await this.bidInMutex(createBidInput, user);
    } finally {
      release();
    }
  }

  async bidInMutex(createBidInput: CreateBidInput, user: User): Promise<Bid> {
    const auction = await this.auctionService.findOne(createBidInput.auctionId);
    // TODO: Uncomment the following code after implementing the auction status
    // if (auction.status !== AuctionStatus.OPEN) {
    //   throw new Error('The auction is not open for bidding');
    // }
    const hasUserJoinedAuction = this.auctionService.hasUserJoinedAuction(
      createBidInput.auctionId,
      user.id,
    );
    if (!hasUserJoinedAuction) {
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
    //Restart the end job if the bid is in the last 10 seconds
    // const endTime = new Date(auction.endTime);
    // const timeLeft = endTime.getTime() - new Date().getTime();
    // if (timeLeft <= 10000) {
    //   const extendedTime = new Date(endTime.getTime() + 10500);
    //   this.scheduler.modifyJob(
    //     `auction-${auction.id}-end`,
    //     extendedTime,
    //     this.auctionService.handleAuctionEnd(auction.id),
    //   );
    // }

    auction.currentPrice = createBidInput.price;
    // Save changes to the database
    await this.auctionService.save(auction);
    const bid = this.bidRepository.create({
      ...createBidInput,
      auction: {
        id: auction.id,
      },
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
      .leftJoinAndSelect('bid.auction', 'auction')
      .orderBy('bid.price', 'DESC');

    return await this.paginate(queryBuilder, page, limit);
  }
}
