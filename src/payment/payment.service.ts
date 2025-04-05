import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import Stripe from 'stripe';
import { EntityNotFoundError, Repository } from 'typeorm';
import { StripeService } from './../stripe/stripe.service';
import { TopUpDto } from './dto/topUp.dto';
import Payment, { PaymentStatus } from './payment.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async getAllPayments(): Promise<Payment[]> {
    const payments = await this.paymentRepository.find({ relations: ['user'] });
    return payments;
  }

  async topUpWallet(topupDto: TopUpDto, user: User): Promise<string> {
    try {
      const session = await this.stripeService.createCheckoutSession(
        topupDto.amount,
        process.env.STRIPE_CURRENCY,
      );
      await this.paymentRepository.save({
        sessionId: session.id,
        user: user,
        amount: topupDto.amount,
        status: PaymentStatus.PENDING,
      });
      return session.url;
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
      throw new EntityNotFoundError(Payment, sessionId);
    }
    const user = paymentObject.user;
    await this.userService.updateUserCredit(
      paymentObject.user.id,
      user.credit + paymentObject.amount / 100,
    );
    await this.paymentRepository.update(
      { id: paymentObject.id },
      { status: PaymentStatus.SUCCESS },
    );
    //todo notify user of successful payment
    this.eventEmitter.emit('NotificationEvent', {
      userIds: [paymentObject.user.id],
      content: 'Your payment was successful',
      title: 'Payment successful',
      type: 'payment',
    });
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
      throw new EntityNotFoundError(Payment, sessionId);
    }
    await this.paymentRepository.update(
      { id: paymentObject.id },
      { status: PaymentStatus.FAILED },
    );
    //todo notify user of failed payment
    this.eventEmitter.emit('NotificationEvent', {
      userIds: [paymentObject.user.id],
      content: 'Your payment was unsuccessful',
      title: 'Payment unsuccessful',
      type: 'payment',
    });
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
