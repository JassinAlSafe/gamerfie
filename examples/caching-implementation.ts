// Examples of how to implement Next.js caching in your gaming platform

import { unstable_cache } from 'next/cache'
import { revalidateTag } from 'next/cache'

// 1. Cache IGDB game details (already implemented in your service)
const getCachedGameDetails = unstable_cache(
  async (gameId: string) => {
    const response = await fetch(`https://api.igdb.com/v4/games`, {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID!,
        'Authorization': `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `fields name, cover.url, rating; where id = ${gameId};`
      }),
      // Cache for 1 hour - game details don't change often
      next: { 
        revalidate: 3600,
        tags: ['game-details', `game-${gameId}`] 
      }
    })
    return response.json()
  },
  ['game-details'], // cache key
  {
    tags: ['games', 'game-details'],
    revalidate: 3600, // 1 hour
  }
)

// 2. Cache popular games list
const getCachedPopularGames = unstable_cache(
  async (page: number = 1) => {
    const response = await fetch('/api/games?category=popular', {
      // Cache for 30 minutes - popular games change slowly
      next: { 
        revalidate: 1800,
        tags: ['popular-games', `page-${page}`] 
      }
    })
    return response.json()
  },
  ['popular-games'],
  {
    tags: ['games', 'popular-games'],
    revalidate: 1800, // 30 minutes
  }
)

// 3. Cache user library (shorter cache time for personalized data)
const getCachedUserLibrary = unstable_cache(
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/library`, {
      // Cache for 5 minutes - user data changes more frequently  
      next: { 
        revalidate: 300,
        tags: ['user-library', `user-${userId}`] 
      }
    })
    return response.json()
  },
  ['user-library'],
  {
    tags: ['user-data', 'library'],
    revalidate: 300, // 5 minutes
  }
)

// 4. Server Actions to invalidate cache when data changes
export async function addGameToLibrary(userId: string, gameId: string) {
  // Add game to library logic here...
  
  // Revalidate relevant caches
  revalidateTag(`user-${userId}`)
  revalidateTag('user-library')
  revalidateTag('user-data')
}

export async function updateGameReview(gameId: string) {
  // Update review logic here...
  
  // Revalidate game-specific caches
  revalidateTag(`game-${gameId}`)
  revalidateTag('game-details')
}

// 5. Usage in components
export async function GameDetailsPage({ gameId }: { gameId: string }) {
  // This will be cached and only refetch after 1 hour
  const gameDetails = await getCachedGameDetails(gameId)
  
  return <div>{/* Game details UI */}</div>
}

export async function PopularGamesPage() {
  // This will be cached and only refetch after 30 minutes
  const popularGames = await getCachedPopularGames()
  
  return <div>{/* Popular games grid */}</div>
}

// 6. Cache different data for different durations
const CACHE_STRATEGIES = {
  // Static content - cache for hours
  GAME_DETAILS: { revalidate: 3600, tags: ['games', 'static'] },
  NEWS_ARTICLES: { revalidate: 1800, tags: ['news', 'static'] },
  
  // Semi-dynamic content - cache for minutes
  POPULAR_GAMES: { revalidate: 900, tags: ['games', 'popular'] },
  SEARCH_RESULTS: { revalidate: 300, tags: ['search', 'dynamic'] },
  
  // User-specific content - cache briefly
  USER_LIBRARY: { revalidate: 60, tags: ['user-data', 'personal'] },
  USER_REVIEWS: { revalidate: 180, tags: ['reviews', 'personal'] },
}