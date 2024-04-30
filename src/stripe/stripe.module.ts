import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Module({
  imports: [],
  providers: [StripeService],
  controllers: [],
  exports: [StripeService],
})
export class StripeModule {}
