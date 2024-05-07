import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { AuctionService } from './auction.service';
import { Auction } from './entities/auction.entity';
import { CreateAuctionInput } from './dto/create-auction.input';
import { UpdateAuctionInput } from './dto/update-auction.input';
import { GetUser } from '../auth/decorators/getUser.decorator';
import User from '../user/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { BidService } from './bid.service';
import { CreateBidInput } from './dto/create-bid.input';
import { Bid } from './entities/bid.entity';
import Conversation from 'src/chat/entities/conversation.entity';
import { ConversationService } from 'src/chat/conversation.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Auction)
export class AuctionResolver {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly bidService: BidService,
    private readonly conversationService: ConversationService,
  ) {}

  @Mutation(() => Auction)
  createAuction(
    @Args('createAuctionInput') createAuctionInput: CreateAuctionInput,
    @GetUser() user: User,
  ) {
    return this.auctionService.createAuction({
      ...createAuctionInput,
      owner: user,
    });
  }

  @Query(() => [Auction], { name: 'auctions' })
  findAll() {
    return this.auctionService.findAll();
  }

  @Query(() => Auction, { name: 'auction' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.auctionService.findOne(id);
  }

  @Mutation(() => Auction)
  updateAuction(
    @Args('updateAuctionInput') updateAuctionInput: UpdateAuctionInput,
  ) {
    return this.auctionService.update(
      updateAuctionInput.id,
      updateAuctionInput,
    );
  }

  @Mutation(() => Auction)
  removeAuction(@Args('id', { type: () => Int }) id: number) {
    return this.auctionService.endAuction(id);
  }

  @Mutation(() => Auction)
  async createBid(
    @Args('createBidInput') createBidInput: CreateBidInput,
    @GetUser() user: User,
  ) {
    await this.bidService.bid(createBidInput, user);
    return this.auctionService.findOne(createBidInput.auctionId);
  }

  @ResolveField()
  async bids(
    @Parent() auction: Auction,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<Bid[]> {
    return this.bidService.getByAuction(auction.id, 1, limit);
  }

  @ResolveField()
  async conversation(@Parent() auction: Auction): Promise<Conversation> {
    return this.conversationService.findByAuction(auction.id);
  }
}
