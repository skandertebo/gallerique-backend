import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeModule } from 'src/stripe/stripe.module';
import UserModule from 'src/user/user.module';
import { TopUpDto } from './dto/paymentDto.dto';
import { PaymentController } from './payment.controller';
import Payment from './payment.entity';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';

@Module({
  imports: [StripeModule, UserModule, TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentController],
  exports: [TopUpDto, PaymentService],
  providers: [PaymentService, TopUpDto, PaymentResolver],
})
export class PaymentModule {}
