import Stripe from 'stripe';
import { StripeService } from './../stripe/stripe.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  constructor(private readonly stripeService: StripeService) {}
  async topUpWallet(
    amount: number,
    currency: string,
    success_url: string,
    cancel_url: string,
  ): Promise<string> {
    try {
      const sessionId = await this.stripeService.createCheckoutSession(
        amount,
        currency,
        success_url,
        cancel_url,
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
}
