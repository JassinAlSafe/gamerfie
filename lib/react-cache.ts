import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import type { Profile, Game, Review, Playlist } from '@/types'

/**
 * React cache() for Request Memoization
 * These functions are memoized per-request to avoid duplicate database calls
 * within the same React render pass
 */

// Profile queries with React cache
export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
})

// Get user's game library with React cache
export const getUserLibrary = cache(async (userId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_games')
    .select(`
      *,
      game:games(*)
    `)
    .eq('user_id', userId)
    .order('added_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching library:', error)
    return []
  }
  
  return data
})

// Get game reviews with React cache
export const getGameReviews = cache(async (gameId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(id, username, avatar_url)
    `)
    .eq('game_id', gameId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
  
  return data
})

// Get user's friends with React cache
export const getUserFriends = cache(async (userId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      friend:profiles!friendships_friend_id_fkey(
        id,
        username,
        display_name,
        avatar_url,
        bio
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted')
  
  if (error) {
    console.error('Error fetching friends:', error)
    return []
  }
  
  return data
})

// Get popular playlists with React cache
export const getPopularPlaylists = cache(async (limit: number = 10) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      creator:profiles(id, username, avatar_url),
      games:playlist_games(count)
    `)
    .eq('is_published', true)
    .order('likes_count', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching playlists:', error)
    return []
  }
  
  return data
})

// Get user activity feed with React cache
export const getUserActivityFeed = cache(async (userId: string, limit: number = 20) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      user:profiles(id, username, avatar_url),
      game:games(id, name, cover_url)
    `)
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching activity:', error)
    return []
  }
  
  return data
})

// Get game statistics with React cache
export const getGameStats = cache(async (gameId: string) => {
  const supabase = await createClient()
  
  // Use parallel queries for better performance
  const [libraryCount, reviewCount, avgRating] = await Promise.all([
    supabase
      .from('user_games')
      .select('id', { count: 'exact' })
      .eq('game_id', gameId),
    
    supabase
      .from('reviews')
      .select('id', { count: 'exact' })
      .eq('game_id', gameId),
    
    supabase
      .from('reviews')
      .select('rating')
      .eq('game_id', gameId)
      .eq('is_public', true)
  ])
  
  const ratings = avgRating.data?.map(r => r.rating).filter(Boolean) || []
  const average = ratings.length > 0 
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
    : 0
  
  return {
    libraryCount: libraryCount.count || 0,
    reviewCount: reviewCount.count || 0,
    averageRating: average,
    totalRatings: ratings.length
  }
})

// Get trending games from database with React cache
export const getTrendingGamesFromDB = cache(async (limit: number = 10) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('library_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching trending games:', error)
    return []
  }
  
  return data
})

// Get user's recent games with React cache
export const getUserRecentGames = cache(async (userId: string, limit: number = 5) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_games')
    .select(`
      *,
      game:games(*)
    `)
    .eq('user_id', userId)
    .order('last_played_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching recent games:', error)
    return []
  }
  
  return data
})

// Get challenges for a user with React cache
export const getUserChallenges = cache(async (userId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('challenge_participants')
    .select(`
      *,
      challenge:challenges(*)
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching challenges:', error)
    return []
  }
  
  return data
})

// Get user games with full details for profile games tab
export const getUserGamesDetailed = cache(async (userId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_games')
    .select(`
      id,
      user_id,
      game_id,
      status,
      play_time,
      created_at,
      updated_at,
      completion_percentage,
      achievements_completed,
      user_rating,
      notes,
      last_played_at,
      games (
        id,
        name,
        cover_url
      )
    `)
    .eq('user_id', userId)
    .order('last_played_at', { ascending: false, nullsFirst: false })
  
  if (error) {
    console.error('Error fetching user games:', error)
    return []
  }
  
  return data
})