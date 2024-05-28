import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/File/file.service';
import { SchedulerService } from 'src/Scheduler/scheduler.service';
import { ConversationService } from 'src/chat/conversation.service';
import GenericServiceWithObservable from 'src/generic/genericWithObservable.service';
import User from 'src/user/user.entity';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { CreateAuctionInput } from './dto/create-auction.input';
import { UpdateAuctionInput } from './dto/update-auction.input';
import { Auction, AuctionStatus } from './entities/auction.entity';

@Injectable()
export class AuctionService extends GenericServiceWithObservable<Auction> {
  //private readonly ENDTIME_DELAY = 5 * 60 * 60 * 1000; // 5 hours
  private readonly ENDTIME_DELAY = 2 * 60 * 1000; // 2 minutes

  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,

    private eventEmitter: EventEmitter2,
    private scheduler: SchedulerService,
    private readonly fileService: FileService,
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
  async createAuction(data: CreateAuctionInput, owner: User) {
    const startDate = new Date(data.startDate);
    const delay = startDate.getTime() - new Date().getTime();
    if (delay < 0)
      throw new BadRequestException('Start date should be a future datetime');

    const filePath = await this.fileService.getFilePath(data.fileUploadToken);
    delete data.fileUploadToken;
    const auctionData = {
      ...data,
      //5 hours from startDate
      //TODO: Config should be centralised
      endTime: new Date(
        new Date(data.startDate).getTime() + this.ENDTIME_DELAY,
      ).toISOString(),
      currentPrice: data.startPrice,
      image: filePath,
      owner,
    };
    const newAuction = await this.create(auctionData);

    //creating a cron job for the start of the auction
    //TODO: add in update
    this.scheduler.addJob(`auction-${newAuction.id}-start`, startDate, () => {
      this.handleAuctionStart(newAuction.id);
    });

    //create conversation for the auction
    await this.conversationService.createAuctionConversation(newAuction);

    return newAuction;
  }

  async updateAuction(updateData: UpdateAuctionInput) {
    if (updateData.startDate) {
      const startDate = new Date(updateData.startDate);
      const delay = startDate.getTime() - new Date().getTime();
      if (delay < 0)
        throw new BadRequestException('Start date should be a future datetime');
    }

    const id = updateData.id;
    delete updateData.id;
    const auction = await this.findOne(id);
    if (auction.status != AuctionStatus.PENDING)
      throw new ForbiddenException('Auction cannot be modified anymore!');

    const filePath = await this.fileService.getFilePath(
      updateData.fileUploadToken,
    );
    delete updateData.fileUploadToken;

    const auctionData = {
      ...updateData,
      //5 hours from startDate
      endTime: new Date(
        new Date(updateData.startDate).getTime() + 5 * 60 * 60 * 1000,
      ).toISOString(),
      currentPrice: updateData.startPrice,
      image: filePath,
    };

    const updatedAuction = await this.update(id, auctionData);
    if (updateData.startDate) {
      this.scheduler.addJob(
        `auction-${auction.id}-start`,
        new Date(updateData.startDate),
        () => {
          this.handleAuctionStart(auction.id);
        },
      );
    }

    return updatedAuction;
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
      this.eventEmitter.emit('NotificationEvent', {
        userIds: userIds,
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
    const auction = await this.findOne(auctionId, {
      relations: ['owner'],
    });
    const topBid = await this.auctionRepository.manager.query(
      'SELECT * FROM bid WHERE auctionId = ? ORDER BY price DESC LIMIT 1',
      [auctionId],
    );
    if (topBid.length == 0) {
      auction.status = AuctionStatus.CLOSED;
      await this.update(auctionId, auction);
      this.emit({
        scope: 'auction.end',
        payload: auction,
      });
      return;
    }
    const topBidder = await this.userService.findOne(topBid[0].ownerId);
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
    auction.winner = topBidder;
    auction.winner.credit -= auction.currentPrice;
    await this.userService.save(auction.winner);
    const updatedAuction = await this.update(auctionId, auction);
    this.emit({
      scope: 'auction.end',
      payload: updatedAuction,
    });
    this.eventEmitter.emit('NotificationEvent', {
      userIds: [auction.winner.id],
      content: `Congratulations You won the auction ${auction.title}!`,
      title: 'Auction End',
      type: 'auction_end',
    });
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

  async isAuctionOwner(auctionId: number, userId: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId, owner: { id: userId } },
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
