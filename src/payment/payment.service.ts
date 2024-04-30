import Stripe from 'stripe';
import { StripeService } from './../stripe/stripe.service';
import { Injectable } from '@nestjs/common';
import { TopUpDto } from './dto/paymentdto';
import { InjectRepository } from '@nestjs/typeorm';
import Payment, { PaymentStatus } from './payment.entity';
import { Repository } from 'typeorm';
import User from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
  ) {}

  async topUpWallet(topupDto: TopUpDto, user: User): Promise<string> {
    try {
      const sessionId = await this.stripeService.createCheckoutSession(
        topupDto.amount,
        topupDto.currency,
        topupDto.successUrl,
        topupDto.cancelUrl,
      );
      await this.paymentRepository.save({
        sessionId,
        userId: user.id,
        amount: topupDto.amount,
        status: PaymentStatus.PENDING,
      });
      return sessionId;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripeService.retrieveCheckoutSession(sessionId);
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async completePayment(sessionId: string): Promise<any> {
    const paymentObject = await this.paymentRepository.findOne({
      where: { sessionId },
    });
    if (!paymentObject) {
      throw new Error('Payment not found');
    }
    const user = await this.userService.getUserById(paymentObject.userId);
    if (!user) {
      throw new Error('User not found');
    }
    await this.userService.updateUserCredit(
      paymentObject.userId,
      user.credit + paymentObject.amount,
    );
    await this.paymentRepository.update(
      { id: paymentObject.id },
      { status: PaymentStatus.SUCCESS },
    );
    return {
      userId: paymentObject.userId,
      message: 'Payment successful',
    };
  }
}
