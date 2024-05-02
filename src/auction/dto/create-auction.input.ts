import { InputType, Field } from '@nestjs/graphql';
import { AuctionStatus } from '../entities/auction.entity';

@InputType()
export class CreateAuctionInput {
  @Field()
  title: string;

  @Field()
  picture: string;

  @Field()
  description: string;

  @Field()
  startPrice: number;

  @Field()
  startDate: string;

  @Field()
  endTime: string;

  @Field()
  status: AuctionStatus;
}
