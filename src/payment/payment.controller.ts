import { Controller, Get } from '@nestjs/common';

@Controller('payment')
export class PaymentController {
  @Get('top-up')
  topUpWallet() {
    return 'Top-up wallet';
  }
}
