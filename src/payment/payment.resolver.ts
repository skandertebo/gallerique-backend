import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import User from 'src/user/user.entity';
import { TopUpDto } from './dto/miste.dto';
import Payment from './payment.entity';
import { PaymentService } from './payment.service';

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Query(() => [Payment])
  @UseGuards(JwtAuthGuard)
  async getPayments(): Promise<Payment[]> {
    //todo check if user is admin
    return this.paymentService.getAllPayments();
  }
  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async topUpWallet(
    @Args('paymentInput') paymentInput: TopUpDto,
    @GetUser() user: User,
  ) {
    const sessionUrl = await this.paymentService.topUpWallet(
      paymentInput,
      user,
    );
    return sessionUrl;
  }
}
