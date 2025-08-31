import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS, CACHE_DURATIONS } from './cache'

// Cache wrapper for API routes
export function withApiCache<T>(
  cacheKey: string[],
  tags: string[] = [CACHE_TAGS.GAMES],
  revalidate: number = CACHE_DURATIONS.GAME_DETAILS
) {
  return function(handler: () => Promise<T>) {
    const cachedHandler = unstable_cache(
      handler,
      cacheKey,
      { tags, revalidate }
    )
    return cachedHandler
  }
}

// Cached fetch for external APIs with Next.js cache options
export async function cachedFetch(
  url: string,
  options: RequestInit & {
    next?: {
      revalidate?: number
      tags?: string[]
    }
  } = {}
): Promise<Response> {
  const defaultOptions = {
    next: {
      revalidate: CACHE_DURATIONS.GAME_DETAILS,
      tags: [CACHE_TAGS.GAMES],
      ...options.next
    }
  }

  return fetch(url, { ...options, ...defaultOptions })
}

// Create cache key from request parameters
export function createCacheKey(prefix: string, params: Record<string, any>): string[] {
  const sortedKeys = Object.keys(params).sort()
  const keyParts = [prefix]
  
  for (const key of sortedKeys) {
    const value = params[key]
    if (value !== undefined && value !== null) {
      keyParts.push(`${key}:${String(value)}`)
    }
  }
  
  return keyParts
}

// Cache response wrapper for API routes
export function cacheApiResponse<T>(
  data: T,
  headers: Record<string, string> = {}
): NextResponse<T> {
  const response = NextResponse.json(data)
  
  // Add cache control headers
  response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
  
  // Add custom headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}