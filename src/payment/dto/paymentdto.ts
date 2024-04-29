import { IsNumber, IsString, IsUrl } from 'class-validator';

export class TopUpDto {
  @IsNumber()
  amount: number;
  @IsString()
  currency: string;
  @IsUrl()
  successUrl: string;
  @IsUrl()
  cancelUrl: string;
}
