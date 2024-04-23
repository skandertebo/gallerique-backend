import { Field, ObjectType } from '@nestjs/graphql';
import { UserStatus } from '../../user/user.entity';

@ObjectType()
export class UserSchema {
  @Field()
  id: number;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  address: string;

  @Field()
  credit: number;

  @Field()
  status: UserStatus;
}
