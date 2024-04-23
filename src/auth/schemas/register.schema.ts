import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RegisterSchema {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  address: string;
}
