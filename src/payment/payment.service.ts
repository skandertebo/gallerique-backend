import Stripe from 'stripe';
import { StripeService } from './../stripe/stripe.service';
import { Injectable } from '@nestjs/common';
import { TopUpDto } from './dto/paymentdto';

@Injectable()
export class PaymentService {
  constructor(private readonly stripeService: StripeService) {}
  async topUpWallet(topupDto: TopUpDto): Promise<string> {
    try {
      const sessionId = await this.stripeService.createCheckoutSession(
        topupDto.amount,
        topupDto.currency,
        topupDto.successUrl,
        topupDto.cancelUrl,
      );
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
    return await this.retrieveCheckoutSession(sessionId);
  }
}
