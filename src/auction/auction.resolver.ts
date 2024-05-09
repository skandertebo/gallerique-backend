import { UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ConversationService } from 'src/chat/conversation.service';
import Conversation from 'src/chat/entities/conversation.entity';
import { GetUser } from '../auth/decorators/getUser.decorator';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import User from '../user/user.entity';
import { AuctionService } from './auction.service';
import { BidService } from './bid.service';
import { CreateAuctionInput } from './dto/create-auction.input';
import { CreateBidInput } from './dto/create-bid.input';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import AuctionOwnerGuard from './guards/auction-owner.guard';

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

  @Query(() => [Auction], { name: 'auctionsOfUser' })
  getAuctionsWhereUserIsOwner(@GetUser() user: User) {
    return this.auctionService.getAuctionsByUser(user.id);
  }

  @Query(() => [Auction], { name: 'auctionsWhereUserIsMember' })
  getAuctionsWhereUserIsMember(@GetUser() user: User) {
    return this.auctionService.getAuctionsWhereUserIsMember(user.id);
  }

  // @Mutation(() => Auction)
  // updateAuction(
  //   @Args('updateAuctionInput') updateAuctionInput: UpdateAuctionInput,
  // ) {
  //   return this.auctionService.update(
  //     updateAuctionInput.id,
  //     updateAuctionInput,
  //   );
  // }

  @Mutation(() => Auction)
  endAuction(@Args('id', { type: () => Int }) id: number) {
    return this.auctionService.endAuction(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuctionOwnerGuard)
  async deleteAuction(@Args('id', { type: () => Int }) id: number) {
    return this.auctionService.delete(id);
  }

  @Mutation(() => Auction)
  async createBid(
    @Args('createBidInput') createBidInput: CreateBidInput,
    @GetUser() user: User,
  ) {
    await this.bidService.bid(createBidInput, user);
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
