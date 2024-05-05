import { Stripe } from 'stripe';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class StripeService {
  private readonly stripeClient: Stripe;
  private readonly webHookSecret: string;

  constructor() {
    this.stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
      appInfo: {
        name: 'gallerique',
        version: '0.0.1',
      },
    });
    this.webHookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }
  async createCheckoutSession(amount: number, currency: string) {
    try {
      const session = await this.stripeClient.checkout.sessions.create({
        payment_method_types: ['card', 'ideal'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: 'Wallet Top-up',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL,
      });
      return session;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripeClient.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      throw new Error(error.message);
    }
  }
  handleSignature(signature: string, payload: Buffer) {
    try {
      const event = this.stripeClient.webhooks.constructEvent(
        payload,
        signature,
        this.webHookSecret,
      );
      return event;
    } catch (error) {
      throw new UnauthorizedException(
        'Webhook signature verification failed:',
        error.message,
      );
    }
  }
}
