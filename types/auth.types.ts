import type { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Profile type from database
export type Profile = Database['public']['Tables']['profiles']['Row']

// Extended user type with profile
export type User = SupabaseUser & {
  profile?: Profile | null
}

// Google OAuth response type
export interface GoogleAuthResponse {
  data: { 
    provider: string
    url: string 
  } | null
  error: AuthError | null
}

// Authentication state interface
export interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

// User metadata for profile creation
export interface UserMetadata {
  username?: string
  display_name?: string
  full_name?: string
  name?: string
  avatar_url?: string
  picture?: string
  [key: string]: any
}

// User existence check result
export interface UserExistsResult {
  exists: boolean
  hasProfile: boolean
  provider?: string
  lastSignIn?: string
  needsEmailVerification?: boolean
}

// Filter value types for games store
export type FilterValue = string | number | boolean | string[] | null | undefined

// Activity types for friends store
export interface ActivityData {
  id: string
  created_at: string
  activity_type: string
  type?: string  // Alternative field name
  game_id?: string
  user_id?: string
  content?: string
  details?: any
  reactions?: ReactionData[]
  comments?: CommentData[]
  user?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
  game?: {
    id: string
    name: string
    cover_image?: string
    cover_url?: string
  }
  game_name?: string
  game_cover_url?: string
  username?: string
  avatar_url?: string
}

export interface ReactionData {
  id: string
  user_id: string
  reaction_type: string
  emoji?: string
  created_at: string
  user?: {
    username: string
    avatar_url?: string
  }
}

export interface CommentData {
  id: string
  user_id: string
  content: string
  created_at: string
  user?: {
    username: string
    avatar_url?: string
  }
}

// Media types for media store
export interface ScreenshotData {
  id?: string
  url: string
  height?: number
  width?: number
  image_id?: string
}

export interface VideoData {
  id?: string
  video_id?: string
  name?: string
  url?: string
  thumbnail_url?: string
  provider?: string
  preview?: string
  data?: {
    480?: string
    max?: string
  }
  external?: string
}

// Game data for processing
export interface GameData {
  id: string | number
  name?: string
  summary?: string
  cover?: {
    id: number | string
    url: string
    image_id?: string
  }
  screenshots?: ScreenshotData[]
  videos?: VideoData[]
  storyline?: any
  rating?: any
  first_release_date?: any
  platforms?: any
  genres?: any
  [key: string]: any
}