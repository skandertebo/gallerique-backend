import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BidService } from './bid.service';
import { CreateBidInput } from './dto/create-bid.input';
import { Bid } from './entities/bid.entity';

@Resolver(() => Bid)
export class BidResolver {
  constructor(private readonly bidService: BidService) {}

  @Mutation(() => Bid)
  createBid(@Args('createBidInput') createBidInput: CreateBidInput) {
    return this.bidService.create(createBidInput);
  }

  @Query(() => [Bid], { name: 'bid' })
  findAll() {
    return this.bidService.findAll();
  }

  @Query(() => Bid, { name: 'bid' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.bidService.findOne(id);
  }
}
