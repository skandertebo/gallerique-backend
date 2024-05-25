import { BadRequestException, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  // Adds a job to be executed at a specific datetime
  addJob(name: string, datetime: Date, callback: () => void): void {
    const now = new Date();
    const delay = datetime.getTime() - now.getTime();

    if (delay < 0)
      throw new BadRequestException('Attempted to schedule a job in the past!');

    const timeout = setTimeout(() => {
      callback();
      this.schedulerRegistry.deleteTimeout(name);
    }, delay);

    this.schedulerRegistry.addTimeout(name, timeout);
  }

  // Deletes a scheduled job
  deleteJob(name: string): void {
    const timeout = this.schedulerRegistry.getTimeout(name);
    if (timeout) {
      this.schedulerRegistry.deleteTimeout(name);
    }
  }

  // Modifies an existing job to run at a new datetime
  modifyJob(name: string, newDatetime: Date, callback): void {
    const timeout = this.schedulerRegistry.getTimeout(name);
    if (timeout) {
      this.schedulerRegistry.deleteTimeout(name);
    }
    this.addJob(name, newDatetime, callback);
  }
}
