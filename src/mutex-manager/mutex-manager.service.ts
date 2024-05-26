import { Injectable } from '@nestjs/common';
import { Mutex, MutexInterface } from 'async-mutex';

export interface MutexMapInterafce {
  lastUsed: number;
  mutex: MutexInterface;
}

@Injectable()
export class MutexService {
  private mutexes: Map<number, MutexMapInterafce>;
  constructor() {
    this.mutexes = new Map();

    setInterval(() => {
      this.cleanUp(1000 * 60 * 60);
    }, 10000);
  }

  public getMutex(auctioId: number): MutexMapInterafce {
    if (!this.mutexes.has(auctioId)) {
      this.mutexes.set(auctioId, {
        lastUsed: Date.now(),
        mutex: new Mutex(),
      });
    }
    return this.mutexes.get(auctioId);
  }
  public deleteMutex(auctioId: number): void {
    this.mutexes.delete(auctioId);
  }
  async lock(auctioId: number) {
    const mutex = this.getMutex(auctioId);
    mutex.lastUsed = Date.now();
    return await mutex.mutex.acquire();
  }
  release(auctioId: number) {
    if (this.mutexes.has(auctioId)) {
      this.mutexes.get(auctioId).mutex.release();
    }
  }
  cleanUp(expiryTime: number): void {
    const now = Date.now();
    this.mutexes.forEach((value, key) => {
      if (now - value.lastUsed > expiryTime) {
        this.deleteMutex(key);
      }
    });
  }
}
