import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { TopUpDto } from './dto/paymentdto';
import { PaymentService } from './payment.service';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [StripeModule],
  controllers: [PaymentController],
  exports: [TopUpDto, PaymentService],
  providers: [PaymentService, TopUpDto],
})
export class PaymentModule {}
