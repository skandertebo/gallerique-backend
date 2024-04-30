import {
  Body,
  Controller,
  Post,
  UseGuards,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TopUpDto } from './dto/paymentdto';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import User from 'src/user/user.entity';
import { StripeService } from 'src/stripe/stripe.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('topup')
  @UseGuards(JwtAuthGuard)
  async topUpWallet(@Body() topUpDto: TopUpDto, @GetUser() user: User) {
    try {
      const sessionId = await this.paymentService.topUpWallet(topUpDto, user);
      return sessionId;
    } catch (error) {
      return {
        status: '400',
        message: error.message,
      };
    }
  }

  @Post('webhook')
  async handleStripeEvents(@Req() req: RawBodyRequest<Request>, @Res() res) {
    try {
      const event = await this.stripeService.constructEvent(req);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        //todo check if the payment is successful
        await this.paymentService.completePayment(session.id);
      }
      res.status(200).json({ received: true });
    } catch (error) {
      res.status(400).json({ received: false });
    }
  }
}
