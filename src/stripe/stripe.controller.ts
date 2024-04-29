import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentService } from 'src/payment/payment.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('webhook')
  async handleStripeEvents(@Req() req: RawBodyRequest<Request>, @Res() res) {
    try {
      const event = await this.stripeService.constructEvent(req);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        await this.paymentService.completePayment(session.id);
      }
      res.status(200).json({ received: true });
    } catch (error) {
      res.status(400).json({ received: false });
    }
  }
}
