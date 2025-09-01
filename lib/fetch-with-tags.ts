/**
 * Enhanced fetch with proper caching and tagging for Next.js Data Cache
 */

import { CACHE_TAGS, CACHE_DURATIONS } from './cache'

interface FetchOptions extends RequestInit {
  tags?: string[]
  revalidate?: number | false
  cache?: 'force-cache' | 'no-store'
}

/**
 * Fetch with automatic tagging for fine-grained cache invalidation
 */
export async function fetchWithTags(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { tags = [], revalidate, cache, ...fetchOptions } = options

  // Build Next.js specific cache options
  const nextOptions: any = {}
  
  if (tags.length > 0) {
    nextOptions.tags = tags
  }
  
  if (revalidate !== undefined) {
    nextOptions.revalidate = revalidate
  }

  return fetch(url, {
    ...fetchOptions,
    cache: cache || 'force-cache',
    next: nextOptions
  })
}

/**
 * Fetch game data with proper tagging
 */
export async function fetchGameData(gameId: string) {
  return fetchWithTags(`/api/games/${gameId}`, {
    tags: [CACHE_TAGS.GAMES, `game-${gameId}`],
    revalidate: CACHE_DURATIONS.GAME_DETAILS
  })
}

/**
 * Fetch user profile with tagging
 */
export async function fetchUserProfile(userId: string) {
  return fetchWithTags(`/api/users/${userId}`, {
    tags: ['users', `user-${userId}`],
    revalidate: 300 // 5 minutes
  })
}

/**
 * Fetch reviews with tagging
 */
export async function fetchReviews(gameId: string) {
  return fetchWithTags(`/api/reviews?gameId=${gameId}`, {
    tags: [CACHE_TAGS.USER_REVIEWS, `reviews-${gameId}`],
    revalidate: CACHE_DURATIONS.USER_REVIEWS
  })
}

/**
 * Fetch news with tagging
 */
export async function fetchNews(category?: string) {
  const url = category 
    ? `/api/news?category=${category}`
    : '/api/news'
    
  return fetchWithTags(url, {
    tags: [CACHE_TAGS.NEWS, category ? `news-${category}` : 'news-all'],
    revalidate: CACHE_DURATIONS.NEWS_ARTICLES
  })
}

/**
 * Fetch playlists with tagging
 */
export async function fetchPlaylists(userId?: string) {
  const url = userId
    ? `/api/playlists?userId=${userId}`
    : '/api/playlists'
    
  return fetchWithTags(url, {
    tags: [CACHE_TAGS.PLAYLISTS, userId ? `playlists-${userId}` : 'playlists-all'],
    revalidate: 600 // 10 minutes
  })
}

/**
 * Fetch friends activity with tagging
 */
export async function fetchFriendsActivity(userId: string) {
  return fetchWithTags(`/api/activity?userId=${userId}`, {
    tags: [CACHE_TAGS.FRIENDS, `activity-${userId}`],
    revalidate: CACHE_DURATIONS.FRIENDS_ACTIVITY
  })
}

/**
 * Fetch search results with shorter cache
 */
export async function fetchSearchResults(query: string, filters?: any) {
  const params = new URLSearchParams({ q: query, ...filters })
  
  return fetchWithTags(`/api/search?${params}`, {
    tags: [CACHE_TAGS.SEARCH_RESULTS, `search-${query}`],
    revalidate: CACHE_DURATIONS.SEARCH_RESULTS
  })
}

/**
 * Fetch with no cache for real-time data
 */
export async function fetchRealtime(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    cache: 'no-store'
  })
}

/**
 * Batch fetch multiple resources with tagging
 */
export async function batchFetch(requests: Array<{
  url: string
  tags?: string[]
  revalidate?: number
}>) {
  return Promise.all(
    requests.map(({ url, tags, revalidate }) =>
      fetchWithTags(url, { tags, revalidate })
    )
  )
}