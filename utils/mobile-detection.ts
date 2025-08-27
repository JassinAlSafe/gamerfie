/**
 * Mobile detection and network optimization utilities
 */

// Mobile device detection with additional checks
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const userAgent = navigator.userAgent;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Check touch capability
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size (fallback for mobile detection)
  const isSmallScreen = window.screen.width <= 768 || window.innerWidth <= 768;
  
  // Check for mobile-specific APIs
  const hasMobileAPIs = 'orientation' in window || 'DeviceMotionEvent' in window;
  
  // Return true if any mobile indicators are present
  return isMobileUserAgent || (hasTouchScreen && isSmallScreen) || hasMobileAPIs;
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
export function getOptimalTimeout(baseTimeout: number = 15000): number {
  const isMobile = isMobileDevice();
  const networkQuality = getNetworkQuality();
  
  // Base timeouts - increased for better reliability
  let timeout = baseTimeout;
  
  // Increase for mobile devices
  if (isMobile) {
    timeout *= 2; // Increased from 1.5 to 2
  }
  
  // Adjust based on network quality
  switch (networkQuality) {
    case '2g':
      timeout *= 3;
      break;
    case '3g':
      timeout *= 2.5; // Increased from 2 to 2.5
      break;
    case '4g':
      timeout *= 1.2; // Slight buffer for 4g
      break;
    default:
      timeout *= 2; // Increased from 1.5 to 2 for unknown networks
      break;
  }
  
  // Cap at reasonable limits - increased maximum
  return Math.min(timeout, 60000); // Max 60 seconds instead of 30
}

// React Query configuration optimized for mobile
export function getMobileOptimizedQueryConfig() {
  const isMobile = isMobileDevice();
  
  return {
    staleTime: isMobile ? 10 * 60 * 1000 : 60 * 1000, // 10 min mobile, 1 min desktop (increased)
    gcTime: isMobile ? 30 * 60 * 1000 : 5 * 60 * 1000, // Longer cache on mobile (increased to 30 min)
    retry: isMobile ? 5 : 2, // More retries for mobile (increased from 3 to 5)
    retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 60000), // Longer delays, higher cap
    refetchOnWindowFocus: false, // Prevent mobile focus issues
    refetchOnReconnect: isMobile, // Retry on network reconnect for mobile
    networkMode: 'online' as const, // Only run queries when online
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
  
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('fetch')) {
    return 'Network error - please check your connection and try again';
  }
  
  if (error.message.includes('timeout')) {
    return 'Request took too long - this might be due to a slow connection';
  }
  
  // Handle generic connection errors
  if (error.message.includes('ERR_NETWORK') || error.message.includes('ERR_INTERNET_DISCONNECTED')) {
    return 'No internet connection - please check your network and try again';
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