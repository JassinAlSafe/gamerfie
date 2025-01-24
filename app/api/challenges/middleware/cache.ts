import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheConfig {
  ttl: number;        // Time to live in seconds
  prefix?: string;    // Cache key prefix
  invalidateOn?: readonly string[]; // Endpoints that should invalidate this cache
}

const defaultConfig: CacheConfig = {
  ttl: 60,           // 1 minute default TTL
  prefix: "cache",
};

// Predefined cache configurations
export const cacheConfigs = {
  leaderboard: {
    ttl: 30,         // 30 seconds for leaderboard
    prefix: "leaderboard",
    invalidateOn: ["/api/challenges/*/goals"], // Invalidate on progress updates
  },
  challengeDetails: {
    ttl: 300,        // 5 minutes for challenge details
    prefix: "challenge",
    invalidateOn: ["/api/challenges/*"],
  },
  userProgress: {
    ttl: 10,         // 10 seconds for user progress
    prefix: "progress",
    invalidateOn: ["/api/challenges/*/goals"],
  },
} as const;

export const withCache = (
  handler: (request: Request, context: { params: Record<string, string> }) => Promise<Response>,
  config: CacheConfig = defaultConfig
) => {
  return async (request: Request, context: { params: Record<string, string> }) => {
    // Only cache GET requests
    if (request.method !== "GET") {
      const response = await handler(request, context);
      
      // Check if this endpoint should invalidate any caches
      if (config.invalidateOn) {
        const url = new URL(request.url).pathname;
        for (const pattern of config.invalidateOn) {
          const regex = new RegExp(pattern.replace("*", ".*"));
          if (regex.test(url)) {
            await invalidateCache(pattern);
          }
        }
      }
      
      return response;
    }

    const url = new URL(request.url).pathname;
    const key = `${config.prefix}:${url}`;

    try {
      // Try to get from cache
      const cached = await redis.get(key);
      if (cached && typeof cached === 'string') {
        return NextResponse.json(JSON.parse(cached));
      }

      // If not in cache, call handler
      const response = await handler(request, context);
      const data = await response.json();

      // Cache the response
      await redis.setex(key, config.ttl, JSON.stringify(data));

      return NextResponse.json(data);
    } catch (error) {
      console.error("Caching error:", error);
      // If caching fails, just return the normal response
      return handler(request, context);
    }
  };
};

async function invalidateCache(pattern: string) {
  try {
    const keys = await redis.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
} 