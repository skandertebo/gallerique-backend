import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [],
  providers: [SchedulerService],
  controllers: [],
  exports: [SchedulerService],
})
export class SchedulerModule {}
