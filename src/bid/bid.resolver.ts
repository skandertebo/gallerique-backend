import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BidService } from './bid.service';
import { CreateBidInput } from './dto/create-bid.input';
import { Bid } from './entities/bid.entity';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import User from 'src/user/user.entity';

@Resolver(() => Bid)
export class BidResolver {
  constructor(private readonly bidService: BidService) {}

  @Mutation(() => Bid)
  createBid(
    @Args('createBidInput') createBidInput: CreateBidInput,
    @GetUser() user: User,
  ) {
    if (user.credit < createBidInput.price) {
      throw new Error('Not enough balance');
    } else {
      const bid = {
        price: createBidInput.price,
        owner: user,
        createdAt: new Date(),
      };
      // add bid to the auction bids
      // update the auction current price
      // update the user credit

      return this.bidService.create(bid);
    }
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
