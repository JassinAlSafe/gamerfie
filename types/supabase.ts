export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          name: string
          cover_url: string | null
          rating: number | null
          first_release_date: number | null
          platforms: any | null
          genres: any | null
          created_at: string
          updated_at: string
        }
        // ... other table definitions
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
        // ... other table definitions
      }
      // ... other tables
    }
  }
} 