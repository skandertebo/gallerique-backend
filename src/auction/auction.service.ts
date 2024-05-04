import { Injectable } from '@nestjs/common';
import GenericService from '../generic/generic.service';
import { Auction, AuctionStatus } from './entities/auction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuctionService extends GenericService<Auction> {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    private readonly userService: UserService,
  ) {
    super(auctionRepository);
  }

  async endAuction(auctionId: number) {
    const auction = await this.findOne(auctionId);
    auction.status = AuctionStatus.CLOSED;
    // Update the owner's credit
    const owner = await this.userService.findOne(auction.owner.id);
    owner.credit += auction.currentPrice;
    await this.userService.save(owner);
    // Update the winner's credit
    auction.winner = auction.bids[auction.bids.length - 1].owner;
    auction.winner.credit -= auction.currentPrice;
    await this.userService.save(auction.winner);
    return this.update(auctionId, auction);
  }
}
