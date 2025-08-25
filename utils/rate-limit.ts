/**
 * Rate limiting utilities for API endpoints
 * 
 * This module provides simple in-memory rate limiting functionality.
 * For production, consider using Redis or a more sophisticated solution.
 */

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitInfo>();

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, info] of rateLimitStore.entries()) {
    if (now > info.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Generate a rate limit key based on IP and endpoint
 */
function generateKey(ip: string, endpoint?: string): string {
  return `${ip}:${endpoint || 'default'}`;
}

/**
 * Check if a request should be rate limited
 */
export function isRateLimited(
  ip: string,
  options: RateLimitOptions,
  endpoint?: string
): { limited: boolean; retryAfter?: number; remaining?: number } {
  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  const key = generateKey(ip, endpoint);
  const now = Date.now();
  const windowEnd = now + options.windowMs;

  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    // First request in window or window has expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: windowEnd,
    });
    return {
      limited: false,
      remaining: options.maxRequests - 1,
    };
  }

  // Increment the count
  existing.count++;
  rateLimitStore.set(key, existing);

  if (existing.count > options.maxRequests) {
    return {
      limited: true,
      retryAfter: Math.ceil((existing.resetTime - now) / 1000),
      remaining: 0,
    };
  }

  return {
    limited: false,
    remaining: options.maxRequests - existing.count,
  };
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export function rateLimitMiddleware(options: RateLimitOptions) {
  return (request: Request): Response | null => {
    const ip = getClientIP(request);
    const url = new URL(request.url);
    const endpoint = url.pathname;

    const result = isRateLimited(ip, options, endpoint);

    if (result.limited) {
      return new Response(
        JSON.stringify({
          error: options.message || 'Too many requests',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': options.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + (result.retryAfter || 60) * 1000) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    return null; // Allow the request to continue
  };
}

/**
 * Extract client IP from request
 */
function getClientIP(request: Request): string {
  // Try various headers in order of preference
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'true-client-ip',   // Akamai
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  // Fallback to a default IP
  return '127.0.0.1';
}

/**
 * Basic IP validation
 */
function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  return ipv6Regex.test(ip);
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Very strict for sensitive operations
  strict: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please try again later.',
  },
  
  // Moderate for general API usage
  moderate: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    message: 'Rate limit exceeded. Please slow down.',
  },
  
  // Lenient for read-only operations
  lenient: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests.',
  },
  
  // For error logging (should be more generous)
  logging: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Error logging rate limit exceeded.',
  },
} as const;