import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TopUpDto } from './dto/paymentdto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('topup')
  async topUpWallet(@Body() topUpDto: TopUpDto) {
    try {
      const sessionId = await this.paymentService.topUpWallet(topUpDto);
      return sessionId;
    } catch (error) {
      return {
        status: '400',
        message: error.message,
      };
    }
  }
}
