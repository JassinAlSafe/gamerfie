/**
 * Performance optimization utilities
 */

/**
 * Creates a throttled version of a function using requestAnimationFrame
 * More performant than setTimeout-based throttling for scroll/resize events
 */
export function throttleRAF<T extends (...args: any[]) => void>(
  func: T,
  leading: boolean = true
): T {
  let isThrottled = false;
  let pendingArgs: Parameters<T> | null = null;

  const throttledFn = (...args: Parameters<T>) => {
    if (isThrottled) {
      pendingArgs = args;
      return;
    }

    if (leading) {
      func(...args);
    } else {
      pendingArgs = args;
    }

    isThrottled = true;

    requestAnimationFrame(() => {
      isThrottled = false;
      if (pendingArgs) {
        const argsToCall = pendingArgs;
        pendingArgs = null;
        if (!leading) {
          func(...argsToCall);
        } else {
          throttledFn(...argsToCall);
        }
      }
    });
  };

  return throttledFn as T;
}

/**
 * Creates a debounced version of a function with cleanup
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn as T & { cancel: () => void };
}

/**
 * Image preloading utility with priority queue
 */
export class ImagePreloader {
  private preloadQueue: Array<{ src: string; priority: number }> = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private currentLoading = 0;

  addToQueue(src: string, priority: number = 0) {
    if (this.preloadQueue.some(item => item.src === src)) {
      return;
    }

    this.preloadQueue.push({ src, priority });
    this.preloadQueue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.currentLoading >= this.maxConcurrent) {
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0 && this.currentLoading < this.maxConcurrent) {
      const item = this.preloadQueue.shift();
      if (item) {
        this.preloadImage(item.src);
      }
    }

    this.isProcessing = false;
  }

  private preloadImage(src: string) {
    this.currentLoading++;
    
    const img = new Image();
    
    const cleanup = () => {
      this.currentLoading--;
      this.processQueue();
    };

    img.onload = cleanup;
    img.onerror = cleanup;
    img.src = src;
  }

  clear() {
    this.preloadQueue = [];
  }
}

/**
 * Singleton image preloader instance
 */
export const imagePreloader = new ImagePreloader();

/**
 * Intersection Observer hook for lazy loading optimization
 */
export function createLazyObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Memory usage monitoring utility
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private listeners: Array<(info: any) => void> = [];

  static getInstance() {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  addListener(callback: (info: any) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (info: any) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  checkMemory() {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const info = {
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
        jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
        usage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
      };

      this.listeners.forEach(listener => listener(info));
      return info;
    }
    return null;
  }

  startMonitoring(interval: number = 10000) {
    const monitor = () => {
      this.checkMemory();
      setTimeout(monitor, interval);
    };
    monitor();
  }
}