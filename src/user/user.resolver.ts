import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserSchema } from '../auth/schemas/user.schema';
import { UserService } from './user.service';
import User from './user.entity';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async getUser(@Args('id') id: number): Promise<UserSchema> {
    const user = await this.userService.findOne(id);
    return user;
  }

  @Query(() => [User])
  async getUsers(): Promise<UserSchema[]> {
    return this.userService.findAll();
  }
}
