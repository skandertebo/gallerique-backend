import { NotFoundException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserSchema } from '../auth/schemas/user.schema';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserSchema)
  async getUser(@Args('id') id: number): Promise<UserSchema> {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Query(() => [UserSchema])
  async getUsers(): Promise<UserSchema[]> {
    return this.userService.findAll();
  }
}
