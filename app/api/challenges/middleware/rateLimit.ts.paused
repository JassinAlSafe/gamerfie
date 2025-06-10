import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface RateLimitConfig {
  maxRequests: number;  // Maximum requests allowed
  windowMs: number;     // Time window in milliseconds
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 20,      // 20 requests
  windowMs: 60 * 1000,  // per minute
};

export const withRateLimit = (handler: Function, config: RateLimitConfig = defaultConfig) => {
  return async (request: Request, ...args: any[]) => {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const endpoint = new URL(request.url).pathname;
    const key = `rate-limit:${ip}:${endpoint}`;

    try {
      // Get the current request count
      const requests = await redis.incr(key);

      // Set expiry on first request
      if (requests === 1) {
        await redis.expire(key, Math.floor(config.windowMs / 1000));
      }

      // Check if rate limit exceeded
      if (requests > config.maxRequests) {
        return NextResponse.json(
          { error: "Too many requests, please try again later" },
          { status: 429 }
        );
      }

      // Call the original handler
      return handler(request, ...args);
    } catch (error) {
      console.error("Rate limiting error:", error);
      // If rate limiting fails, still allow the request
      return handler(request, ...args);
    }
  };
}; 