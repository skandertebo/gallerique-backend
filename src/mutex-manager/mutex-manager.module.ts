import { Module } from '@nestjs/common';
import { MutexService } from './mutex-manager.service';

@Module({
  providers: [MutexService],
  exports: [MutexService],
})
export class MutexManagerModule {}
