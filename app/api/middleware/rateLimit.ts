import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let redis: Redis;

// Initialize Redis based on environment
if (process.env.NODE_ENV === 'test') {
  // Mock Redis for testing
  redis = {
    incr: async () => 1,
    expire: async () => true,
    get: async () => null,
    set: async () => true,
  } as unknown as Redis;
} else {
  // Real Redis instance for production/development
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

export const withRateLimit = (handler: Function, config: RateLimitConfig) => {
  return async (request: Request, ...args: any[]) => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test') {
      return handler(request, ...args);
    }

    const identifier = config.identifier || request.headers.get("x-forwarded-for") || "anonymous";
    const key = `rate-limit:${identifier}:${request.url}`;

    try {
      const requests = await redis.incr(key);
      
      if (requests === 1) {
        await redis.expire(key, Math.floor(config.windowMs / 1000));
      }

      if (requests > config.maxRequests) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }

      return handler(request, ...args);
    } catch (error) {
      console.error("Rate limit error:", error);
      // Fail open - allow request if rate limiting fails
      return handler(request, ...args);
    }
  };
}; 