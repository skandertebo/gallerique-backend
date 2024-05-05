import { IsNumber, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TopUpDto {
  @Field()
  @IsNumber()
  amount: number;

  @Field()
  @IsString()
  currency: string;
}
