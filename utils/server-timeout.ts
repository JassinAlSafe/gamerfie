/**
 * Server-side timeout utilities for API calls
 * Best practice for preventing hanging requests, especially on mobile networks
 */

/**
 * Detect if request is from mobile device (server-side)
 */
export function isMobileUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

/**
 * Get optimal timeout for server-side requests based on client type
 */
export function getServerTimeout(userAgent: string | null): number {
  const isMobile = isMobileUserAgent(userAgent);
  
  // Base timeouts (in milliseconds)
  const DESKTOP_TIMEOUT = 10000; // 10 seconds for desktop
  const MOBILE_TIMEOUT = 20000;  // 20 seconds for mobile
  
  return isMobile ? MOBILE_TIMEOUT : DESKTOP_TIMEOUT;
}

/**
 * Create a fetch with timeout using AbortController
 * This is a best practice for preventing hanging requests
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs?: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = timeoutMs || 15000; // Default 15 seconds
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms - The server took too long to respond. This might be due to high load or network issues.`);
      }
    }
    
    throw error;
  }
}

/**
 * Retry logic with exponential backoff for server-side requests
 * Best practice for handling transient failures
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  timeoutMs?: number
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Exponential backoff: 1s, 2s, 4s
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await fetchWithTimeout(url, options, timeoutMs);
      
      // Success or client error (4xx) - don't retry
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      // Server error (5xx) - retry
      lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt + 1} failed:`, error);
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}