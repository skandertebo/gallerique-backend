import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import GenericService from '../generic/generic.service';
import User from '../user/user.entity';
import Conversation, { ConversationType } from './entities/conversation.entity';
import { Auction } from 'src/auction/entities/auction.entity';

@Injectable()
export class ConversationService extends GenericService<Conversation> {
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
