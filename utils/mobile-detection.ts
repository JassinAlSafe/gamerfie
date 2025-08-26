/**
 * Mobile detection and network optimization utilities
 */

// Mobile device detection
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Network quality detection
export type NetworkQuality = '2g' | '3g' | '4g' | 'unknown';

export function getNetworkQuality(): NetworkQuality {
  if (typeof window === 'undefined') return 'unknown';
  
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  }
  return 'unknown';
}

// Get timeout based on device and network quality
export function getOptimalTimeout(baseTimeout: number = 8000): number {
  const isMobile = isMobileDevice();
  const networkQuality = getNetworkQuality();
  
  // Base timeouts
  let timeout = baseTimeout;
  
  // Increase for mobile devices
  if (isMobile) {
    timeout *= 1.5;
  }
  
  // Adjust based on network quality
  switch (networkQuality) {
    case '2g':
      timeout *= 3;
      break;
    case '3g':
      timeout *= 2;
      break;
    case '4g':
      timeout *= 1;
      break;
    default:
      timeout *= 1.5;
      break;
  }
  
  // Cap at reasonable limits
  return Math.min(timeout, 30000); // Max 30 seconds
}

// React Query configuration optimized for mobile
export function getMobileOptimizedQueryConfig() {
  const isMobile = isMobileDevice();
  
  return {
    staleTime: isMobile ? 5 * 60 * 1000 : 60 * 1000, // 5 min mobile, 1 min desktop
    gcTime: isMobile ? 15 * 60 * 1000 : 5 * 60 * 1000, // Longer cache on mobile
    retry: isMobile ? 3 : 1, // More retries for mobile
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Prevent mobile focus issues
    refetchOnReconnect: isMobile, // Retry on network reconnect for mobile
  };
}

// Intersection observer configuration optimized for mobile
export function getMobileOptimizedIntersectionConfig() {
  const isMobile = isMobileDevice();
  
  return {
    threshold: 0,
    rootMargin: isMobile ? "400px" : "200px", // Larger margin for mobile
    triggerOnce: false,
  };
}

// Enhanced error handling for mobile
export function handleMobileNetworkError(error: Error): string {
  if (error.name === 'AbortError') {
    return 'Request timed out - please check your internet connection and try again';
  }
  
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    return 'Network error - please check your connection and try again';
  }
  
  if (error.message.includes('timeout')) {
    return 'Request took too long - this might be due to a slow connection';
  }
  
  return error.message;
}

// Create AbortController with mobile-optimized timeout
export function createMobileOptimizedAbortController(baseTimeout?: number): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();
  const timeout = getOptimalTimeout(baseTimeout);
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  return { controller, timeoutId };
}