import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateNotificationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  type: string;
}
