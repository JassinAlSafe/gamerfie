export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          settings: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          updated_at?: string
          username?: string
        }
      }
      games: {
        Row: {
          cover_url: string | null
          created_at: string
          first_release_date: number | null
          genres: Json | null
          id: string
          name: string
          platforms: Json | null
          rating: number | null
          storyline: string | null
          summary: string | null
          total_rating_count: number | null
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          first_release_date?: number | null
          genres?: Json | null
          id: string
          name: string
          platforms?: Json | null
          rating?: number | null
          storyline?: string | null
          summary?: string | null
          total_rating_count?: number | null
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          first_release_date?: number | null
          genres?: Json | null
          id?: string
          name?: string
          platforms?: Json | null
          rating?: number | null
          storyline?: string | null
          summary?: string | null
          total_rating_count?: number | null
          updated_at?: string
        }
      }
      user_games: {
        Row: {
          achievements_completed: number | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          display_order: number | null
          game_id: string
          id: string
          last_played_at: string | null
          notes: string | null
          play_time: number | null
          status: Database["public"]["Enums"]["game_status"] | null
          updated_at: string
          user_id: string
          user_rating: number | null
        }
        Insert: {
          achievements_completed?: number | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          display_order?: number | null
          game_id: string
          id?: string
          last_played_at?: string | null
          notes?: string | null
          play_time?: number | null
          status?: Database["public"]["Enums"]["game_status"] | null
          updated_at?: string
          user_id: string
          user_rating?: number | null
        }
        Update: {
          achievements_completed?: number | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          display_order?: number | null
          game_id?: string
          id?: string
          last_played_at?: string | null
          notes?: string | null
          play_time?: number | null
          status?: Database["public"]["Enums"]["game_status"] | null
          updated_at?: string
          user_id?: string
          user_rating?: number | null
        }
      }
    }
    Enums: {
      user_role: "user" | "admin" | "moderator"
      game_status: "playing" | "completed" | "want_to_play" | "dropped"
      friend_status: "pending" | "accepted" | "blocked" | "declined"
    }
  }
}