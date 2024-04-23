import { Field, ObjectType } from '@nestjs/graphql';
import { UserSchema } from './user.schema';

@ObjectType()
export class AuthSchema {
  @Field()
  access_token: string;

  @Field(() => UserSchema)
  user: UserSchema;
}
