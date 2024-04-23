import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginSchema {
  @Field()
  email: string;

  @Field()
  password: string;
}
