import { createClient } from "@/utils/supabase/client";
import { PlaylistService } from "./playlistService";
import { UnifiedGameService } from "./unifiedGameService";
import { Playlist } from "@/types/playlist";
import { Game } from "@/types";

interface ExploreData {
  featuredPlaylists: Playlist[];
  recentlyAdded: Game[];
  totalPlaylists: number;
}

export class ExploreService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_TTL = 3 * 60 * 1000; // 3 minutes for explore data
  private static readonly LONG_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for static data

  /**
   * Get all explore page data in one optimized call
   * Reduces API calls from 50+ to 3-5 total
   */
  static async getExploreData(): Promise<ExploreData> {
    const cacheKey = 'explore_data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      // Fetch featured playlists with optimized batch loading
      const featuredPlaylists = await PlaylistService.getFeaturedPlaylists(5);
      
      // Get recently added games from trending (faster than individual API calls)
      const recentlyAdded = await UnifiedGameService.getTrendingGames(10);
      
      // Get total playlists count
      const supabase = createClient();
      const { count } = await supabase
        .from('playlists')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      const exploreData: ExploreData = {
        featuredPlaylists,
        recentlyAdded,
        totalPlaylists: count || 0
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: exploreData,
        timestamp: Date.now()
      });

      return exploreData;
    } catch (error) {
      console.error('Failed to fetch explore data:', error);
      // Return empty data with cached fallback if available
      return {
        featuredPlaylists: [],
        recentlyAdded: [],
        totalPlaylists: 0
      };
    }
  }

  /**
   * Get featured playlists with preview games (only 3 games per playlist)
   * Optimized for initial page load
   */
  static async getFeaturedPlaylistsPreview(): Promise<Playlist[]> {
    const cacheKey = 'featured_playlists_preview';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const supabase = createClient();
      
      // Get featured playlists with minimal data
      const { data: playlists, error } = await supabase
        .from('playlists')
        .select(`
          id,
          title,
          description,
          cover_image,
          type,
          created_at,
          playlist_games (
            game_id,
            display_order
          )
        `)
        .eq('is_published', true)
        .eq('type', 'featured')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (!playlists || playlists.length === 0) {
        console.warn('No featured playlists found');
        return [];
      }

      // Get only the first 3 games per playlist for preview
      const playlistsWithPreview = await Promise.all(
        playlists.map(async (playlist) => {
          // Handle case where playlist_games might be empty or null
          const playlistGames = playlist.playlist_games || [];
          const topGameIds = playlistGames
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .slice(0, 3)
            .map(pg => pg.game_id);

          // Fetch games for this playlist
          const validGames: Game[] = [];
          try {
            if (topGameIds.length > 0) {
              // Fetch all top games instead of just the first one
              const gamePromises = topGameIds.map(async (gameId) => {
                try {
                  const game = await UnifiedGameService.getGameDetails(gameId);
                  if (game) {
                    return { ...game, id: gameId };
                  }
                  return null;
                } catch (error) {
                  console.warn(`Failed to fetch game ${gameId}:`, error);
                  return null;
                }
              });
              
              const games = await Promise.allSettled(gamePromises);
              games.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                  validGames.push(result.value);
                }
              });
            }
          } catch (error) {
            console.warn('Failed to fetch games for playlist:', error);
          }

          return {
            id: playlist.id,
            title: playlist.title,
            description: playlist.description,
            coverImage: playlist.cover_image,
            type: playlist.type as any,
            slug: playlist.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            isPublished: true,
            start_date: new Date(),
            createdAt: playlist.created_at,
            updatedAt: playlist.created_at,
            createdBy: '',
            gameIds: topGameIds,
            games: validGames
          } as Playlist;
        })
      );

      // Cache the result
      this.cache.set(cacheKey, {
        data: playlistsWithPreview,
        timestamp: Date.now()
      });

      return playlistsWithPreview;
    } catch (error) {
      console.error('Failed to fetch featured playlists preview:', error);
      return [];
    }
  }

  /**
   * Preload game details for better UX
   * Runs in background after initial page load
   */
  static async preloadGameDetails(gameIds: string[]): Promise<void> {
    // Use a longer cache TTL for preloaded data
    const BATCH_SIZE = 5;
    const batches = [];
    
    for (let i = 0; i < gameIds.length; i += BATCH_SIZE) {
      batches.push(gameIds.slice(i, i + BATCH_SIZE));
    }

    // Process batches with delay to avoid overwhelming the API
    for (const batch of batches) {
      setTimeout(async () => {
        await Promise.allSettled(
          batch.map(async (gameId) => {
            const cacheKey = `game_details_${gameId}`;
            const cached = this.cache.get(cacheKey);
            
            if (!cached || Date.now() - cached.timestamp > this.LONG_CACHE_TTL) {
              try {
                const game = await UnifiedGameService.getGameDetails(gameId);
                if (game) {
                  this.cache.set(cacheKey, {
                    data: game,
                    timestamp: Date.now()
                  });
                }
              } catch (error) {
                console.warn(`Failed to preload game ${gameId}:`, error);
              }
            }
          })
        );
      }, batches.indexOf(batch) * 100); // Stagger requests
    }
  }

  /**
   * Get cached game details if available
   */
  static getCachedGameDetails(gameId: string): Game | null {
    const cacheKey = `game_details_${gameId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.LONG_CACHE_TTL) {
      return cached.data;
    }
    
    return null;
  }

  /**
   * Clear all caches
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      entries: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
} 