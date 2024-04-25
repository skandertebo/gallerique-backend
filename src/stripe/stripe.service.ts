import { Stripe } from 'stripe';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeService {
  private readonly stripeClient: Stripe;

  constructor() {
    this.stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
      appInfo: {
        name: 'gallerique',
        version: '0.0.1',
      },
    });
  }
  async createCheckoutSession(
    amount: number,
    currency: string,
    success_url: string,
    cancel_url: string,
  ): Promise<string> {
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
        success_url,
        cancel_url,
      });
      return session.id;
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
}
