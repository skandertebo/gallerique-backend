import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from 'src/chat/conversation.service';
import GenericServiceWithObservable from 'src/generic/genericWithObservable.service';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Auction, AuctionStatus } from './entities/auction.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerService } from 'src/Scheduler/scheduler.service';

@Injectable()
export class AuctionService extends GenericServiceWithObservable<Auction> {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
    private eventEmitter: EventEmitter2,
    private scheduler: SchedulerService,
  ) {
    super(auctionRepository);
    // This is implemented in case the server restarts and we lose in-memory cron jobs
    this.initializeScheduledTasks();
  }

  private async initializeScheduledTasks() {
    const notStartedAuctions = await this.getNotStartedAuctions();
    const ongoingAuctions = await this.getOngoingAuctions();

    notStartedAuctions.forEach((auction) => {
      const startDate = new Date(auction.startDate);
      if (startDate > new Date()) {
        this.scheduler.addJob(`auction-${auction.id}-start`, startDate, () => {
          this.handleAuctionStart(auction.id);
        });
      }
    });

    ongoingAuctions.forEach((auction) => {
      const endDate = new Date(auction.endTime);
      if (endDate > new Date()) {
        this.scheduler.addJob(`auction-${auction.id}-end`, endDate, () => {
          this.handleAuctionEnd(auction.id);
        });
      }
    });
  }
  async createAuction(auction: Partial<Auction>) {
    const startDate = new Date(auction.startDate);
    const delay = startDate.getTime() - new Date().getTime();
    if (delay < 0)
      throw new BadRequestException('Start date should be a future datetime');
    auction = {
      ...auction,
      //5 hours from startDate
      //TODO: Config should be centralised
      endTime: new Date(startDate.getTime() + 5 * 60 * 60 * 1000).toISOString(),
      currentPrice: auction.startPrice,
    };
    const newAuction = await this.create(auction);

    //creating a cron job for the start of the auction
    //TODO: add in update
    this.scheduler.addJob(`auction-${newAuction.id}-start`, startDate, () =>
      this.handleAuctionStart(newAuction.id),
    );

    //create conversation for the auction
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

  async handleAuctionStart(auctionId: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
      relations: ['members'],
    });

    if (auction) {
      const userIds = auction.members.map((member) => member.id);
      this.eventEmitter.emit('notification.event', {
        userIds: [userIds],
        content: 'The auction you joined has started!',
        title: 'Auction Start',
        type: 'auction_start',
      });
      //creating a cron job for the end of the auction
      this.scheduler.addJob(
        `auction-${auction.id}-end`,
        new Date(auction.endTime),
        () => this.handleAuctionEnd(auction.id),
      );
    }
  }

  async handleAuctionEnd(auctionId: number) {
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
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId, members: { id: userId } },
    });
    return !!auction;
  }

  async joinAuction(auctionId: number, userId: number) {
    const user = await this.userService.findOne(userId);
    const auction = await this.findOne(auctionId, { relations: ['members'] });
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

  async getOngoingAuctions() {
    const currentDate = new Date().toISOString();
    return await this.auctionRepository.find({
      where: {
        startDate: LessThanOrEqual(currentDate),
        endTime: MoreThan(currentDate),
      },
    });
  }

  async getNotStartedAuctions() {
    const currentDate = new Date().toISOString();
    return await this.auctionRepository.find({
      where: {
        startDate: MoreThan(currentDate),
      },
    });
  }
}
