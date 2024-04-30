import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { TopUpDto } from './dto/paymentdto';
import { PaymentService } from './payment.service';
import { StripeModule } from 'src/stripe/stripe.module';
import UserModule from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import Payment from './payment.entity';

@Module({
  imports: [StripeModule, UserModule, TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentController],
  exports: [TopUpDto, PaymentService],
  providers: [PaymentService, TopUpDto],
})
export class PaymentModule {}
