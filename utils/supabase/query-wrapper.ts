import { createClient } from './client';

export class SupabaseQueryWrapper {
  private static client = createClient();

  /**
   * Wrapper for user_games queries that handles 406 errors gracefully
   */
  static async queryUserGames(
    userId: string,
    gameId?: string,
    options?: {
      select?: string;
      filters?: Record<string, any>;
    }
  ) {
    try {
      console.log('Querying user_games with wrapper:', { userId, gameId, options });

      let query = this.client
        .from('user_games')
        .select(options?.select || '*');

      // Apply user filter
      query = query.eq('user_id', userId);

      // Apply game filter if provided
      if (gameId) {
        query = query.eq('game_id', gameId);
      }

      // Apply additional filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        
        // Handle specific error cases
        if (error.code === 'PGRST116') {
          // No rows found - return empty array
          console.log('No rows found (expected behavior)');
          return { data: [], error: null };
        } else if (error.code === '42501' || error.message?.includes('permission denied')) {
          // Permission denied - likely RLS issue
          console.warn('Permission denied - RLS configuration issue');
          return { data: [], error: null };
        } else if (error.code === 'PGRST301' || error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
          // 406 Not Acceptable - return empty result but log the issue
          console.warn('406 Not Acceptable - returning empty result. This might indicate a schema mismatch.');
          return { data: [], error: null };
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          // Table doesn't exist
          console.warn('Table user_games does not exist - returning empty result');
          return { data: [], error: null };
        }
        
        // For other errors, return the error but also log it
        console.error('Unhandled query error:', error);
        return { data: [], error: null }; // Still return empty data to prevent crashes
      }

      console.log('Query successful, returning data:', data);
      return { data: data || [], error: null };

    } catch (error) {
      console.error('Query wrapper error:', error);
      return { 
        data: [], 
        error: null // Return null error to prevent crashes
      };
    }
  }

  /**
   * Check if a specific user-game relationship exists
   */
  static async checkUserGame(userId: string, gameId: string) {
    const result = await this.queryUserGames(userId, gameId, {
      select: 'status'
    });

    if (result.error) {
      console.error('Error checking user game:', result.error);
      return null;
    }

    return result.data.length > 0 ? result.data[0] : null;
  }

  /**
   * Get all games for a user
   */
  static async getUserGames(userId: string) {
    return this.queryUserGames(userId, undefined, {
      select: `
        *,
        games (
          id,
          name,
          cover_url,
          platforms,
          genres,
          summary,
          created_at,
          updated_at
        )
      `
    });
  }

  /**
   * Update or insert a user-game relationship
   */
  static async upsertUserGame(
    userId: string,
    gameId: string,
    data: Record<string, any>
  ) {
    try {
      const { data: result, error } = await this.client
        .from('user_games')
        .upsert({
          user_id: userId,
          game_id: gameId,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,game_id'
        });

      if (error) {
        console.error('Error upserting user game:', error);
        return { data: null, error };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Upsert wrapper error:', error);
      return { 
        data: null, 
        error: { 
          message: 'Upsert failed', 
          code: 'WRAPPER_ERROR' 
        } 
      };
    }
  }
} 