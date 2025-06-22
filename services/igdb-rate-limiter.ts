// Advanced IGDB Rate Limiter to handle "Too Many Requests" errors
class IGDBRateLimiter {
  private queue: Array<{
    resolve: (data: any) => void;
    reject: (error: any) => void;
    request: () => Promise<any>;
    gameId: string;
  }> = [];
  
  private processing = false;
  private activeRequests = 0;
  private readonly maxConcurrent = 1; // Very conservative for IGDB
  private readonly minDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;
  private consecutiveFailures = 0;
  private backoffDelay = 1000;
  private readonly maxBackoffDelay = 30000; // 30 seconds max
  private circuitBreakerOpen = false;
  private circuitBreakerResetTime = 0;
  
  // Request cache to avoid duplicate requests
  private requestCache = new Map<string, Promise<any>>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async enqueue<T>(gameId: string, request: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request for this game
    const existingRequest = this.requestCache.get(gameId);
    if (existingRequest) {
      console.log(`🔄 Using cached request for game ${gameId}`);
      return existingRequest;
    }

    const promise = new Promise<T>((resolve, reject) => {
      this.queue.push({
        resolve,
        reject,
        request,
        gameId
      });
      this.processQueue();
    });

    // Cache the promise
    this.requestCache.set(gameId, promise);
    
    // Clean up cache after timeout
    setTimeout(() => {
      this.requestCache.delete(gameId);
    }, this.cacheTimeout);

    return promise;
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0 || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      // Check circuit breaker
      if (this.circuitBreakerOpen) {
        if (Date.now() < this.circuitBreakerResetTime) {
          console.log('🔴 IGDB Circuit breaker open, waiting...');
          await this.sleep(5000);
          continue;
        } else {
          console.log('🟡 IGDB Circuit breaker reset');
          this.circuitBreakerOpen = false;
          this.consecutiveFailures = 0;
          this.backoffDelay = 1000;
        }
      }

      // Enforce minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelay) {
        await this.sleep(this.minDelay - timeSinceLastRequest);
      }

      // Apply exponential backoff if we've had failures
      if (this.consecutiveFailures > 0) {
        console.log(`⏳ IGDB Applying backoff delay: ${this.backoffDelay}ms (failures: ${this.consecutiveFailures})`);
        await this.sleep(this.backoffDelay);
      }

      const { resolve, reject, request, gameId } = this.queue.shift()!;
      this.activeRequests++;
      this.lastRequestTime = Date.now();

      console.log(`🎮 Processing IGDB request for game ${gameId} (queue: ${this.queue.length}, active: ${this.activeRequests})`);

      try {
        const result = await request();
        this.handleSuccess();
        resolve(result);
      } catch (error: any) {
        this.handleFailure(error);
        reject(error);
      } finally {
        this.activeRequests--;
      }
    }

    this.processing = false;
  }

  private handleSuccess() {
    this.consecutiveFailures = 0;
    this.backoffDelay = 1000;
    console.log('✅ IGDB request successful');
  }

  private handleFailure(error: any) {
    this.consecutiveFailures++;
    const errorMessage = error?.message || String(error);
    
    if (errorMessage.includes('Too Many Requests') || errorMessage.includes('429')) {
      console.log('🚫 IGDB Rate limit hit, opening circuit breaker');
      this.circuitBreakerOpen = true;
      // Exponentially increase circuit breaker timeout
      const timeoutMinutes = Math.min(this.consecutiveFailures * 2, 10); // 2-10 minutes
      this.circuitBreakerResetTime = Date.now() + (timeoutMinutes * 60000);
      this.backoffDelay = Math.min(this.backoffDelay * 2, this.maxBackoffDelay);
      
      console.log(`🔴 IGDB Circuit breaker will reset in ${timeoutMinutes} minutes`);
    } else {
      // For other errors, apply lighter backoff
      this.backoffDelay = Math.min(this.backoffDelay * 1.5, 10000);
    }

    console.log(`❌ IGDB request failed (${this.consecutiveFailures} consecutive failures):`, errorMessage);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      circuitBreakerOpen: this.circuitBreakerOpen,
      consecutiveFailures: this.consecutiveFailures,
      backoffDelay: this.backoffDelay,
      cacheSize: this.requestCache.size
    };
  }

  // Clear cache manually if needed
  clearCache() {
    this.requestCache.clear();
    console.log('🧹 Cleared IGDB request cache');
  }
}

// Export singleton instance
export const igdbRateLimiter = new IGDBRateLimiter();