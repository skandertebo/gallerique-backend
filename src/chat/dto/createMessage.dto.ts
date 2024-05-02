import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export default class createMessageDTO {
  @Field(() => ID)
  @IsNotEmpty()
  conversationId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string;
}
