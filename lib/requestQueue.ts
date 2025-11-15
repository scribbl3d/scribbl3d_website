type QueuedRequest = () => Promise<any>;

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private maxConcurrent = 1;
  private delayBetweenRequests = 30000; // 30 seconds

  constructor(maxConcurrent = 1, delayBetweenRequests = 30000) {
    this.maxConcurrent = maxConcurrent;
    this.delayBetweenRequests = delayBetweenRequests;
  }

  enqueue(request: QueuedRequest) {
    this.queue.push(request);
    this.processQueue();
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const request = this.queue.shift();
        if (request) {
          try {
            await request();
          } catch (error) {
            console.error("Error processing queued request:", error);
          }
          // Wait for specified delay before processing the next request
          if (this.queue.length > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, this.delayBetweenRequests)
            );
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  clear() {
    this.queue = [];
    this.processing = false;
  }

  get length() {
    return this.queue.length;
  }

  get isProcessing() {
    return this.processing;
  }
}

export const phonepeRequestQueue = new RequestQueue(1, 30000);
