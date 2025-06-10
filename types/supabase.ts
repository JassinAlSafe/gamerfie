export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          name: string
          cover_url: string | null
          cover: {
            id: number
            url: string
          } | null
          rating: number | null
          first_release_date: number | null
          platforms: string[] | null
          genres: string[] | null
          summary: string | null
          storyline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cover_url?: string | null
          cover: {
            id: number
            url: string
          } | null
          rating?: number | null
          first_release_date?: number | null
          platforms?: string[] | null
          genres?: string[] | null
          summary?: string | null
          storyline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cover_url?: string | null
          cover?: {
            id: number
            url: string
          } | null
          rating?: number | null
          first_release_date?: number | null
          platforms?: string[] | null
          genres?: string[] | null
          summary?: string | null
          storyline?: string | null
          updated_at?: string
        }
      }
      user_games: {
        Row: {
          id: string
          user_id: string | null
          game_id: string | null
          status: string | null
          play_time: number | null
          user_rating: number | null
          completed_at: string | null
          notes: string | null
          last_played_at: string | null
          display_order: number | null
          created_at: string
          updated_at: string
          completion_percentage: number | null
          achievements_completed: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          game_id?: string | null
          status?: string | null
          play_time?: number | null
          user_rating?: number | null
          completed_at?: string | null
          notes?: string | null
          last_played_at?: string | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
          completion_percentage?: number | null
          achievements_completed?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          game_id?: string | null
          status?: string | null
          play_time?: number | null
          user_rating?: number | null
          completed_at?: string | null
          notes?: string | null
          last_played_at?: string | null
          display_order?: number | null
          updated_at?: string
          completion_percentage?: number | null
          achievements_completed?: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          role: 'admin' | 'user' | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          avatar_url?: string | null
          role?: 'admin' | 'user' | null
          full_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          role?: 'admin' | 'user' | null
          full_name?: string | null
          bio?: string | null
          updated_at?: string
        }
      }
      list_comments: {
        Row: {
          id: string
          list_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          list_id?: string
          user_id?: string
          content?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      increment_participants_count: {
        Args: { challenge_id: string }
        Returns: void
      }
      decrement_participants_count: {
        Args: { challenge_id: string }
        Returns: void
      }
    }
  }
}