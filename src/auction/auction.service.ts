import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from 'src/chat/conversation.service';
import GenericServiceWithObservable from 'src/generic/genericWithObservable.service';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Auction, AuctionStatus } from './entities/auction.entity';

@Injectable()
export class AuctionService extends GenericServiceWithObservable<Auction> {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
  ) {
    super(auctionRepository);
  }
  async createAuction(auction: Partial<Auction>) {
    auction = {
      ...auction,
      //5 hours from startDate
      //TODO: Config should be centralised
      endTime: new Date(
        new Date(auction.startDate).getTime() + 5 * 60 * 60 * 1000,
      ).toISOString(),
      currentPrice: auction.startPrice,
    };
    const newAuction = await this.create(auction);

    await this.conversationService.createAuctionConversation(newAuction);

    return newAuction;
  }

  async isOwner(auctionId: number, userId: number) {
    const result = await this.auctionRepository.query(
      'SELECT * FROM auction WHERE id = ? AND ownerId = ?',
      [auctionId, userId],
    );
    return !!result;
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

  async getAuctionsWhereUserIsMember(userId: number) {
    return this.auctionRepository.find({
      where: { members: { id: userId } },
    });
  }

  async hasUserJoinedAuction(auctionId: number, userId: number) {
    return !!this.auctionRepository.find({
      where: { id: auctionId, members: { id: userId } },
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
