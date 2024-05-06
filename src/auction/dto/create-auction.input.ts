import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAuctionInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  startPrice: number;

  @Field()
  startDate: string;
}
