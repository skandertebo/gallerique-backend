import { MutexService } from './mutex.service';

describe('MutexService', () => {
  let mutexService: MutexService;

  beforeEach(() => {
    mutexService = new MutexService();
  });

  afterEach(() => {
    mutexService.cleanUp(0); // Clean up all mutexes after each test
  });

  it('should lock and release a mutex correctly', async () => {
    const auctionId = 1;
    const mutex = mutexService.getMutex(auctionId);

    await mutexService.lock(auctionId);
    expect(mutex.mutex.isLocked()).toBe(true); // Mutex should be locked after acquiring

    mutexService.release(auctionId);
    expect(mutex.mutex.isLocked()).toBe(false); // Mutex should be released after releasing
  });

  it('should process functions sequentially for the same auction', async () => {
    const auctionId = 1;
    const results: number[] = [];

    const task = async (id: number) => {
      await mutexService.lock(auctionId);
      results.push(id);
      mutexService.release(auctionId);
    };

    await Promise.all([task(1), task(2), task(3)]);

    expect(results).toEqual([1, 2, 3]); // Tasks should be processed sequentially
  });

  it('should process functions concurrently for different auctions', async () => {
    const results: { auctionId: number; order: number }[] = [];

    const task = async (auctionId: number, order: number) => {
      await mutexService.lock(auctionId);
      results.push({ auctionId, order });
      mutexService.release(auctionId);
    };

    await Promise.all([task(1, 1), task(2, 2), task(3, 3)]);

    // Check that tasks for different auctions are not blocking each other
    expect(results).toContainEqual({ auctionId: 1, order: 1 });
    expect(results).toContainEqual({ auctionId: 2, order: 2 });
    expect(results).toContainEqual({ auctionId: 3, order: 3 });
  });

  it('should clean up old mutexes', async () => {
    const auctionId = 1;
    mutexService.getMutex(auctionId); // Create a mutex

    // Simulate passage of time
    jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 10000);

    mutexService.cleanUp(5000); // Clean up mutexes older than 5 seconds

    expect(mutexService['mutexes'].size).toBe(0); // Mutex should be cleaned up
  });
});
