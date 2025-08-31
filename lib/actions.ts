'use server'

import { revalidateTag, revalidatePath } from 'next/cache'
import { CACHE_TAGS } from './cache'

// Game-related revalidation
export async function revalidateGameData(gameId?: string) {
  if (gameId) {
    revalidateTag(`${CACHE_TAGS.GAME_DETAILS}-${gameId}`)
  } else {
    revalidateTag(CACHE_TAGS.GAMES)
    revalidateTag(CACHE_TAGS.POPULAR_GAMES)
  }
}

// User library revalidation
export async function revalidateUserLibrary(userId: string) {
  revalidateTag(`${CACHE_TAGS.USER_LIBRARY}-${userId}`)
  revalidatePath('/library')
  revalidatePath('/profile')
}

// Search results revalidation
export async function revalidateSearchResults() {
  revalidateTag(CACHE_TAGS.SEARCH_RESULTS)
  revalidatePath('/search')
  revalidatePath('/games')
}

// Reviews revalidation
export async function revalidateReviews(gameId?: string) {
  if (gameId) {
    revalidateTag(`${CACHE_TAGS.USER_REVIEWS}-${gameId}`)
    revalidatePath(`/game/${gameId}`)
  } else {
    revalidateTag(CACHE_TAGS.USER_REVIEWS)
  }
}

// News revalidation
export async function revalidateNews(slug?: string) {
  if (slug) {
    revalidatePath(`/news/${slug}`)
  } else {
    revalidateTag(CACHE_TAGS.NEWS)
    revalidatePath('/news')
  }
}

// Friends and social revalidation
export async function revalidateFriends(userId: string) {
  revalidateTag(`${CACHE_TAGS.FRIENDS}-${userId}`)
  revalidatePath('/friends')
  revalidatePath('/profile')
}

// Playlist revalidation
export async function revalidatePlaylists(userId?: string, playlistId?: string) {
  if (playlistId) {
    revalidatePath(`/playlists/${playlistId}`)
  }
  if (userId) {
    revalidateTag(`${CACHE_TAGS.PLAYLISTS}-${userId}`)
  }
  revalidatePath('/playlists')
}