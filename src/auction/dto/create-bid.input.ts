import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBidInput {
  @Field()
  auctionId: number;

  @Field()
  price: number;
}
