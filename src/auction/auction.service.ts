import { Injectable } from '@nestjs/common';
import GenericService from '../generic/generic.service';
import { Auction, AuctionStatus } from './entities/auction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';

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
    //check if the end time has passed
    const auction = await this.findOne(auctionId);
    const endTime = new Date(auction.endTime);
    if (new Date() < endTime) {
      throw new Error('The auction has not ended yet');
    }
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

  async getAuctionsByUser(userId: number) {
    return this.auctionRepository.find({
      where: { owner: { id: userId } },
    });
  }

  async joinAuction(auctionId: number, userId: number) {
    const user = await this.userService.findOne(userId);
    const auction = await this.findOne(auctionId);
    if (user == auction.owner) {
      throw new Error('You cannot join your own auction');
    }
    auction.members.push(user);
    return this.update(auctionId, auction);
  }

  async getAuctionsByStatus(status: AuctionStatus) {
    return this.auctionRepository.find({
      where: { status },
    });
  }

  async getNumberOfMembers(auctionId: number) {
    const auction = await this.findOne(auctionId);
    return auction.members.length;
  }
}
