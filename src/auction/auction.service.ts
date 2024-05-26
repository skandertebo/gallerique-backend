import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from 'src/chat/conversation.service';
import GenericServiceWithObservable from 'src/generic/genericWithObservable.service';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Auction, AuctionStatus } from './entities/auction.entity';
import { FileService } from 'src/File/file.service';
import { CreateAuctionInput } from './dto/create-auction.input';
import User from 'src/user/user.entity';
import { UpdateAuctionInput } from './dto/update-auction.input';

@Injectable()
export class AuctionService extends GenericServiceWithObservable<Auction> {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
    private readonly fileService: FileService,
  ) {
    super(auctionRepository);
  }
  async createAuction(data: CreateAuctionInput, owner: User) {
    const filePath = await this.fileService.getFilePath(data.fileUploadToken);
    delete data.fileUploadToken;
    const auctionData = {
      ...data,
      //5 hours from startDate
      //TODO: Config should be centralised
      endTime: new Date(
        new Date(data.startDate).getTime() + 5 * 60 * 60 * 1000,
      ).toISOString(),
      currentPrice: data.startPrice,
      image: filePath,
      owner,
    };
    const newAuction = await this.create(auctionData);

    await this.conversationService.createAuctionConversation(newAuction);

    return newAuction;
  }

  async updateAuction(updateData: UpdateAuctionInput) {
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

    return await this.update(id, auctionData);
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
}
