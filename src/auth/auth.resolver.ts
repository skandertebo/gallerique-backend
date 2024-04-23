import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import User from '../user/user.entity';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/getUser.decorator';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { AuthSchema } from './schemas/auth.schema';
import { LoginSchema } from './schemas/login.schema';
import { RegisterSchema } from './schemas/register.schema';
import { UserSchema } from './schemas/user.schema';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthSchema)
  async login(
    @Args('loginInput') loginInput: LoginSchema,
  ): Promise<AuthSchema> {
    const { email, password } = loginInput;
    const user = await this.authService.validateUser(email, password);
    const loginRes = await this.authService.login(user);
    return loginRes;
  }

  @Mutation(() => AuthSchema)
  async register(
    @Args('registerInput') registerInput: RegisterSchema,
  ): Promise<AuthSchema> {
    const registration = await this.authService.register(registerInput);
    return registration;
  }

  @Query(() => UserSchema)
  @UseGuards(JwtAuthGuard)
  async whoAmI(@GetUser() user: User): Promise<UserSchema> {
    const { password, ...result } = user;
    return result;
  }
}
