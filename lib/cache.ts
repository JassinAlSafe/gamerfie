import { unstable_cache } from 'next/cache'

// Cache configuration constants
export const CACHE_TAGS = {
  GAMES: 'games',
  GAME_DETAILS: 'game-details',
  POPULAR_GAMES: 'popular-games',
  SEARCH_RESULTS: 'search-results',
  USER_LIBRARY: 'user-library',
  USER_REVIEWS: 'user-reviews',
  PLAYLISTS: 'playlists',
  FRIENDS: 'friends',
  NEWS: 'news',
  FORUM: 'forum'
} as const

export const CACHE_DURATIONS = {
  // Static content - cache for longer
  GAME_DETAILS: 3600, // 1 hour
  POPULAR_GAMES: 1800, // 30 minutes
  NEWS_ARTICLES: 900, // 15 minutes
  
  // Dynamic content - cache for shorter periods
  SEARCH_RESULTS: 300, // 5 minutes
  USER_LIBRARY: 60, // 1 minute
  USER_REVIEWS: 300, // 5 minutes
  
  // Real-time content - very short cache
  FRIENDS_ACTIVITY: 30, // 30 seconds
  FORUM_POSTS: 60, // 1 minute
} as const

// Generic cache wrapper for IGDB API calls
export function cacheIGDBRequest<T>(
  fn: () => Promise<T>,
  cacheKey: string[],
  options: {
    tags?: string[]
    revalidate?: number
  } = {}
) {
  return unstable_cache(
    fn,
    cacheKey,
    {
      tags: options.tags || [CACHE_TAGS.GAMES],
      revalidate: options.revalidate || CACHE_DURATIONS.GAME_DETAILS,
    }
  )
}

// Specific cache functions for common operations
export function cacheGameDetails(gameId: string, fn: () => Promise<any>) {
  return cacheIGDBRequest(
    fn,
    ['game-details', gameId],
    {
      tags: [CACHE_TAGS.GAME_DETAILS],
      revalidate: CACHE_DURATIONS.GAME_DETAILS,
    }
  )
}

export function cachePopularGames(page: number, filters: string, fn: () => Promise<any>) {
  return cacheIGDBRequest(
    fn,
    ['popular-games', page.toString(), filters],
    {
      tags: [CACHE_TAGS.POPULAR_GAMES],
      revalidate: CACHE_DURATIONS.POPULAR_GAMES,
    }
  )
}

export function cacheSearchResults(query: string, page: number, fn: () => Promise<any>) {
  return cacheIGDBRequest(
    fn,
    ['search-results', query, page.toString()],
    {
      tags: [CACHE_TAGS.SEARCH_RESULTS],
      revalidate: CACHE_DURATIONS.SEARCH_RESULTS,
    }
  )
}

export function cacheUserLibrary(userId: string, fn: () => Promise<any>) {
  return cacheIGDBRequest(
    fn,
    ['user-library', userId],
    {
      tags: [CACHE_TAGS.USER_LIBRARY],
      revalidate: CACHE_DURATIONS.USER_LIBRARY,
    }
  )
}