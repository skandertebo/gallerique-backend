import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction } from 'src/auction/entities/auction.entity';
import GenericServiceWithObservable from 'src/generic/genericWithObservable.service';
import { Repository } from 'typeorm';
import User from '../user/user.entity';
import Conversation, { ConversationType } from './entities/conversation.entity';

@Injectable()
export class ConversationService extends GenericServiceWithObservable<Conversation> {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {
    super(conversationRepository);
  }

  async createNormalConversation(users: User[]) {
    return await this.create({
      type: ConversationType.NORMAL,
      users: users,
    });
  }

  async createAuctionConversation(auction: Auction): Promise<Conversation> {
    return await this.create({
      type: ConversationType.AUCTION,
      auction,
    });
  }
  async getUsers(conversationId: number) {
    const conversation = await this.findOne(conversationId, {
      relations: ['users'],
    });
    return conversation.users;
  }

  async findByAuction(auctionId: number) {
    const result = this.conversationRepository.findOne({
      where: { auction: { id: auctionId } },
    });
    if (!result) {
      throw new NotFoundException(
        `Conversation from that auction was not found`,
      );
    }
    return result;
  }
}
