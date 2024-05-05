import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateNotificationInput {
  @Field(() => [ID], { nullable: true })
  @IsArray()
  @IsOptional()
  userIds: number[];

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
