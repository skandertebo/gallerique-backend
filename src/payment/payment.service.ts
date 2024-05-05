import Stripe from 'stripe';
import { StripeService } from './../stripe/stripe.service';
import { HttpException, Injectable } from '@nestjs/common';
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
  async getAllPayments(): Promise<Payment[]> {
    const payments = await this.paymentRepository.find({ relations: ['user'] });
    return payments;
  }

  async topUpWallet(topupDto: TopUpDto, user: User): Promise<string> {
    try {
      const sessionId = await this.stripeService.createCheckoutSession(
        topupDto.amount,
        topupDto.currency,
      );
      await this.paymentRepository.save({
        sessionId: sessionId,
        user: user,
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
  async handlePaymentSucceeded(sessionId: string) {
    const paymentObject = await this.paymentRepository.findOne({
      where: { sessionId: sessionId },
      relations: ['user'],
    });
    if (!paymentObject) {
      throw new Error('Payment not found');
    }
    const user = paymentObject.user;
    await this.userService.updateUserCredit(
      paymentObject.user.id,
      user.credit + paymentObject.amount,
    );
    await this.paymentRepository.update(
      { id: paymentObject.id },
      { status: PaymentStatus.SUCCESS },
    );
    //todo notify user of successful payment
    return {
      userId: paymentObject.user,
      message: 'Payment successful',
    };
  }
  async handlePaymentFailed(sessionId: string) {
    const paymentObject = await this.paymentRepository.findOne({
      where: { sessionId: sessionId },
      relations: ['user'],
    });
    if (!paymentObject) {
      throw new Error('Payment not found');
    }
    await this.paymentRepository.update(
      { id: paymentObject.id },
      { status: PaymentStatus.FAILED },
    );
    //todo notify user of failed payment
  }
  handleSignature(signature: string, payload: Buffer) {
    try {
      return this.stripeService.handleSignature(signature, payload);
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async handleStripeWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === 'paid') {
        await this.handlePaymentSucceeded(session.id);
      } else {
        await this.handlePaymentFailed(session.id);
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.handlePaymentFailed(session.id);
    } else {
      throw new HttpException('Invalid event type', 500);
    }
  }
}
