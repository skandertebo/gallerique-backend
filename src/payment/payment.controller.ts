import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { RequestWithRawBody } from './interfaces/requestWithRawBody.interface';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  async handleStripeEvents(
    @Headers('stripe-signature') signature,
    @Req() req: RequestWithRawBody,
    @Res() res: any,
  ) {
    try {
      const event = await this.paymentService.handleSignature(
        signature,
        req.rawBody,
      );
      await this.paymentService.handleStripeWebhook(event);
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(400);
    }
  }
}
