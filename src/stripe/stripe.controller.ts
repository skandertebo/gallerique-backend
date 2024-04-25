import { Controller, Post, Req, Res } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('webhook')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  async handleStripeEvents(@Req() req, @Res() res) {
    try {
      const event = await this.stripeService.constructEvent(req);
      if (event.type === 'checkout.session.completed') {
        // const session = event.data.object;
      }
      res.status(200).json({ received: true });
    } catch (error) {
      res.status(400).json({ received: false });
    }
  }
}
