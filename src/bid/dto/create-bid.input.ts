import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBidInput {
  @Field()
  price: number;

  @Field()
  createdAt: string;
}
