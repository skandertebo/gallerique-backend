import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import Payment from './payment.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import User from 'src/user/user.entity';
import { TopUpDto } from './dto/paymentdto';

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
    const sessionId = await this.paymentService.topUpWallet(paymentInput, user);
    return sessionId;
  }
}
