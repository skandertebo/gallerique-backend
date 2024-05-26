import { Module } from '@nestjs/common';
import { MutexService } from './mutexService';

@Module({
  providers: [MutexService],
  exports: [MutexService],
})
export class MutexManagerModule {}
