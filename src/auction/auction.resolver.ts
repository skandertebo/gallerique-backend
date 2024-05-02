import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuctionService } from './auction.service';
import { Auction } from './entities/auction.entity';
import { CreateAuctionInput } from './dto/create-auction.input';
import { UpdateAuctionInput } from './dto/update-auction.input';
import { BidService } from '../bid/bid.service';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import User from 'src/user/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Auction)
export class AuctionResolver {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly bidService: BidService,
  ) {}

  @Mutation(() => Auction)
  createAuction(
    @Args('createAuctionInput') createAuctionInput: CreateAuctionInput,
    @GetUser() user: User,
  ) {
    const auction = {
      ...createAuctionInput,
      owner: user,
    };
    return this.auctionService.create(auction);
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
    this.auctionService.findOne(id).then((auction) => {
      auction.bids.forEach((bid) => {
        this.bidService.delete(bid.id);
      });
    });
    return this.auctionService.delete(id);
  }
}
