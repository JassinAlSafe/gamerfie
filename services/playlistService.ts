import { createClient } from "@/utils/supabase/client";
import { Playlist, CreatePlaylistInput, UpdatePlaylistInput, PlaylistType } from '@/types/playlist';
import { UnifiedGameService } from './unifiedGameService';
import { useAuthStore } from '@/stores/useAuthStore';

interface DatabasePlaylistGame {
  game_id: string;
  display_order: number;
  added_at: string;
}

interface DatabasePlaylist {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  type: string;
  slug: string;
  is_published: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  order?: number;
  metadata?: Record<string, any>;
  playlist_games: DatabasePlaylistGame[];
}

export class PlaylistService {
  private static supabase = createClient();
  private static playlistCache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static subscriptions = new Map<string, any>();

  static async createPlaylist(input: CreatePlaylistInput): Promise<Playlist> {
    try {
      const user = useAuthStore().user;
      if (!user) {
        throw new Error('Not authenticated');
      }

      if (!user.profile?.role || user.profile.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data: playlist, error } = await this.supabase
        .from('playlists')
        .insert({
          title: input.title,
          description: input.description,
          type: input.type,
          cover_image: input.coverImage,
          is_published: input.isPublished ?? false,
          start_date: input.startDate && input.startDate.trim() !== '' ? input.startDate : null,
          end_date: input.endDate && input.endDate.trim() !== '' ? input.endDate : null,
          created_by: user.id,
          slug,
          metadata: input.metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Playlist creation error:', error);
        throw new Error(error.message || 'Failed to create playlist');
      }

      if (input.gameIds?.length) {
        // Ensure all games exist in the games table before creating associations
        await this.ensureGamesExist(input.gameIds);

        const playlistGames = input.gameIds.map((gameId, index) => ({
          playlist_id: playlist.id,
          game_id: gameId,
          display_order: index,
          added_at: new Date().toISOString()
        }));

        const { error: gameError } = await this.supabase
          .from('playlist_games')
          .insert(playlistGames);

        if (gameError) {
          console.error('Game association error:', gameError);
          if (gameError.code === '23503') {
            throw new Error(`Foreign key constraint violation: One or more games don't exist in the games table. Game IDs: ${input.gameIds.join(', ')}`);
          }
          throw new Error(`Failed to associate games with playlist: ${gameError.message}`);
        }
      }

      // Invalidate relevant caches after successful creation
      await this.invalidatePlaylistCaches();

      return this.mapDatabasePlaylist(playlist);
    } catch (error) {
      console.error('CreatePlaylist error:', error);
      throw error;
    }
  }

  static async updatePlaylist(input: UpdatePlaylistInput): Promise<Playlist> {
    const updates: any = {
      ...(input.title && {
        title: input.title,
        slug: input.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }),
      ...(input.description && { description: input.description }),
      ...(input.type && { type: input.type }),
      ...(input.coverImage && { cover_image: input.coverImage }),
      ...(typeof input.isPublished === 'boolean' && { is_published: input.isPublished }),
      ...(input.startDate && input.startDate.trim() !== '' && { start_date: input.startDate }),
      ...(input.endDate && input.endDate.trim() !== '' && { end_date: input.endDate }),
      ...(input.metadata && { metadata: input.metadata }),
      updated_at: new Date().toISOString()
    };

    const { data: playlist, error } = await this.supabase
      .from('playlists')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single();

    if (error) throw error;

    if (input.gameIds) {
      // Ensure all games exist in the games table before updating associations
      await this.ensureGamesExist(input.gameIds);

      // Remove existing games
      await this.supabase
        .from('playlist_games')
        .delete()
        .eq('playlist_id', input.id);

      // Add new games
      const playlistGames = input.gameIds.map((gameId, index) => ({
        playlist_id: playlist.id,
        game_id: gameId,
        display_order: index,
        added_at: new Date().toISOString()
      }));

      const { error: gameError } = await this.supabase
        .from('playlist_games')
        .insert(playlistGames);

      if (gameError) {
        console.error('Game association error in update:', gameError);
        if (gameError.code === '23503') {
          throw new Error(`Foreign key constraint violation: One or more games don't exist in the games table. Game IDs: ${input.gameIds.join(', ')}`);
        }
        throw new Error(`Failed to associate games with playlist: ${gameError.message}`);
      }
    }

    // Invalidate relevant caches after successful update
    await this.invalidatePlaylistCaches();

    return this.mapDatabasePlaylist(playlist);
  }

  static async getPlaylist(id: string): Promise<Playlist | null> {
    // First, get the playlist
    const { data: playlist, error: playlistError } = await this.supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (playlistError) throw playlistError;
    if (!playlist) return null;

    // Then, get the playlist_games
    const { data: playlistGames, error: gamesError } = await this.supabase
      .from('playlist_games')
      .select('*')
      .eq('playlist_id', id)
      .order('display_order');

    if (gamesError) throw gamesError;

    // Combine the data
    const playlistWithGames = {
      ...playlist,
      playlist_games: playlistGames || []
    };

    // Fetch games data using unified service for better covers and metadata
    const gameIds = playlistWithGames.playlist_games.map((pg: DatabasePlaylistGame) => pg.game_id);
    const games = await Promise.all(
      gameIds.map(async (id: string) => {
        try {
          const game = await UnifiedGameService.getGameDetails(id);
          if (game) {
            // Preserve the original ID for playlist games to maintain correct routing
            return { ...game, id };
          }
          return null;
        } catch (error) {
          console.warn(`Failed to fetch game details for ID ${id}:`, error);
          return null;
        }
      })
    );

    // Filter out null results
    const validGames = games.filter((game): game is NonNullable<typeof game> => game !== null);

    return {
      ...this.mapDatabasePlaylist(playlistWithGames as DatabasePlaylist),
      games: validGames.sort((a, b) => {
        const aOrder = playlistWithGames.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === a.id)?.display_order ?? 0;
        const bOrder = playlistWithGames.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === b.id)?.display_order ?? 0;
        return aOrder - bOrder;
      })
    };
  }

  static async getPlaylists(type?: string): Promise<Playlist[]> {
    let query = this.supabase
      .from('playlists')
      .select(`
        *,
        playlist_games (
          game_id,
          display_order,
          added_at
        )
      `)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: playlists, error } = await query;

    if (error) throw error;

    return Promise.all(
      playlists.map(async (playlist: DatabasePlaylist) => {
        const gameIds = playlist.playlist_games.map((pg: DatabasePlaylistGame) => pg.game_id);
        const games = await Promise.all(
          gameIds.map(async (id: string) => {
            try {
              const game = await UnifiedGameService.getGameDetails(id);
              if (game) {
                // Preserve the original ID for playlist games to maintain correct routing
                return { ...game, id };
              }
              return null;
            } catch (error) {
              console.warn(`Failed to fetch game details for ID ${id}:`, error);
              return null;
            }
          })
        );

        // Filter out null results
        const validGames = games.filter((game): game is NonNullable<typeof game> => game !== null);

        return {
          ...this.mapDatabasePlaylist(playlist),
          games: validGames.sort((a, b) => {
            const aOrder = playlist.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === a.id)?.display_order ?? 0;
            const bOrder = playlist.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === b.id)?.display_order ?? 0;
            return aOrder - bOrder;
          })
        };
      })
    );
  }

  static async getAllPlaylistsForAdmin(type?: string): Promise<Playlist[]> {
    try {
      // First, get the playlists
      let query = this.supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data: playlists, error: playlistError } = await query;

      if (playlistError) {
        console.error('Error fetching playlists:', playlistError);
        throw playlistError;
      }

      if (!playlists) {
        return [];
      }

      // Then, get all playlist_games for these playlists
      const playlistIds = playlists.map(p => p.id);
      
      if (playlistIds.length === 0) {
        return [];
      }

      const { data: playlistGames, error: gamesError } = await this.supabase
        .from('playlist_games')
        .select('*')
        .in('playlist_id', playlistIds)
        .order('playlist_id, display_order');

      if (gamesError) {
        console.error('Error fetching playlist games:', gamesError);
        throw gamesError;
      }

      // Combine the data
      const playlistsWithGames = playlists.map(playlist => ({
        ...playlist,
        playlist_games: (playlistGames || []).filter(pg => pg.playlist_id === playlist.id)
      }));

      // Return simplified playlist data without fetching all game details for admin dashboard
      return playlistsWithGames.map((playlist: DatabasePlaylist) => ({
        ...this.mapDatabasePlaylist(playlist),
        games: [] // We'll populate this if needed for specific playlists
      }));
    } catch (error) {
      console.error('Failed to fetch playlists for admin:', error);
      return [];
    }
  }

  private static async ensureGamesExist(gameIds: string[]): Promise<void> {
    try {
      // Check which games already exist
      const { data: existingGames, error: checkError } = await this.supabase
        .from('games')
        .select('id')
        .in('id', gameIds);

      if (checkError) {
        console.error('Error checking existing games:', checkError);
        throw checkError;
      }

      const existingGameIds = existingGames?.map(game => game.id) || [];
      const missingGameIds = gameIds.filter(id => !existingGameIds.includes(id));

      if (missingGameIds.length > 0) {
        console.log(`Creating ${missingGameIds.length} missing games:`, missingGameIds);
        
        // Fetch game details from UnifiedGameService and create missing games
        const gamesData = await Promise.allSettled(
          missingGameIds.map(async (gameId) => {
            try {
              const gameData = await UnifiedGameService.getGameDetails(gameId);
              if (!gameData) {
                throw new Error(`Game not found: ${gameId}`);
              }
              
              // Prioritize proper game covers over background images (screenshots)
              const getCoverUrl = () => {
                // First try to get the actual game cover
                if (gameData.cover?.url) return gameData.cover.url;
                if (gameData.cover_url) return gameData.cover_url;
                // Fall back to background image only if no cover available
                return gameData.background_image || null;
              };

              return {
                id: gameId,
                name: gameData.name || 'Unknown Game',
                cover_url: getCoverUrl(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            } catch (error) {
              console.warn(`Failed to fetch game data for ${gameId}:`, error);
              // Return minimal game data as fallback
              return {
                id: gameId,
                name: 'Unknown Game',
                cover_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
          })
        );

        // Filter successful results and insert them
        const validGamesData = gamesData
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map(result => result.value);

        if (validGamesData.length > 0) {
          const { error: insertError } = await this.supabase
            .from('games')
            .insert(validGamesData);

          if (insertError) {
            console.error('Error inserting missing games:', insertError);
            throw insertError;
          }

          console.log(`Successfully created ${validGamesData.length} games`);
        }
      }
    } catch (error) {
      console.error('Error ensuring games exist:', error);
      throw error;
    }
  }

  static async deletePlaylist(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Invalidate relevant caches after successful deletion
    await this.invalidatePlaylistCaches();
  }

  static subscribeToPlaylist(playlistId: string, callback: (playlist: Playlist) => void) {
    let debounceTimer: NodeJS.Timeout;
    
    const debouncedCallback = async () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          const playlist = await this.getPlaylist(playlistId);
          if (playlist) {
            callback(playlist);
          }
        } catch (error) {
          console.error(`Failed to fetch playlist ${playlistId} after change:`, error);
        }
      }, 300); // 300ms debounce
    };

    const subscription = this.supabase
      .channel(`playlist_${playlistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlist_games',
          filter: `playlist_id=eq.${playlistId}`,
        },
        debouncedCallback
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      subscription.unsubscribe();
    };
  }

  private static mapDatabasePlaylist(dbPlaylist: DatabasePlaylist): Playlist {
    return {
      id: dbPlaylist.id,
      title: dbPlaylist.title,
      description: dbPlaylist.description,
      coverImage: dbPlaylist.cover_image,
      type: dbPlaylist.type as PlaylistType,
      slug: dbPlaylist.slug,
      isPublished: dbPlaylist.is_published,
      start_date: dbPlaylist.start_date ? new Date(dbPlaylist.start_date) : new Date(),
      end_date: dbPlaylist.end_date ? new Date(dbPlaylist.end_date) : undefined,
      createdAt: dbPlaylist.created_at,
      updatedAt: dbPlaylist.updated_at,
      createdBy: dbPlaylist.created_by,
      gameIds: (dbPlaylist.playlist_games || []).map((pg: DatabasePlaylistGame) => pg.game_id),
      display_order: dbPlaylist.order,
      metadata: dbPlaylist.metadata
    };
  }

  /**
   * Get featured playlists optimized for the explore page
   * Uses caching and batch processing for better performance
   */
  static async getFeaturedPlaylists(limit: number = 10): Promise<Playlist[]> {
    try {
      // Check cache first
      const cacheKey = `featured_playlists_${limit}`;
      const cached = this.playlistCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log('Using cached featured playlists');
        return Array.isArray(cached.data) ? cached.data : [cached.data];
      }

      console.log('Fetching fresh featured playlists...');

      // First, get the playlists
      const { data: playlists, error: playlistError } = await this.supabase
        .from('playlists')
        .select('*')
        .eq('is_published', true)
        .eq('type', 'featured')
        .order('display_order', { ascending: true })
        .limit(limit);

      if (playlistError) throw playlistError;

      if (!playlists || playlists.length === 0) {
        console.warn('No featured playlists found');
        return [];
      }

      // Then, get all playlist_games for these playlists
      const playlistIds = playlists.map(p => p.id);
      const { data: playlistGames, error: gamesError } = await this.supabase
        .from('playlist_games')
        .select('*')
        .in('playlist_id', playlistIds)
        .order('playlist_id, display_order');

      if (gamesError) throw gamesError;

      // Combine the data
      const playlistsWithGames = playlists.map(playlist => ({
        ...playlist,
        playlist_games: playlistGames?.filter(pg => pg.playlist_id === playlist.id) || []
      }));

      // Batch process all games for all playlists at once
      const allGameIds = new Set<string>();
      playlistsWithGames.forEach((playlist: DatabasePlaylist) => {
        playlist.playlist_games.forEach((pg: DatabasePlaylistGame) => {
          allGameIds.add(pg.game_id);
        });
      });

      // Fetch all games in one batch operation
      const gameDetailsMap = await this.batchFetchGameDetails(Array.from(allGameIds));

      // Process playlists with pre-fetched game data
      const processedPlaylists = playlistsWithGames.map((playlist: DatabasePlaylist) => {
        const games = playlist.playlist_games
          .map((pg: DatabasePlaylistGame) => {
            const game = gameDetailsMap.get(pg.game_id);
            if (!game) {
              console.warn(`No game found for ID: ${pg.game_id}`);
            }
            return game;
          })
          .filter((game): game is NonNullable<typeof game> => game !== null)
          .sort((a, b) => {
            const aOrder = playlist.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === a.id)?.display_order ?? 0;
            const bOrder = playlist.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === b.id)?.display_order ?? 0;
            return aOrder - bOrder;
          })
          .slice(0, 5); // Only take first 5 games for featured display

        return {
          ...this.mapDatabasePlaylist(playlist),
          games
        };
      });

      // Cache the result with longer TTL for featured playlists
      this.playlistCache.set(cacheKey, {
        data: processedPlaylists as any,
        timestamp: Date.now()
      });

      console.log(`Cached ${processedPlaylists.length} featured playlists`);
      return processedPlaylists;
    } catch (error) {
      console.error('Failed to fetch featured playlists:', error);
      return [];
    }
  }

  /**
   * Batch fetch game details with caching and fallback handling
   */
  private static async batchFetchGameDetails(gameIds: string[]): Promise<Map<string, any>> {
    const gameMap = new Map();
    const uncachedIds: string[] = [];

    // Check what's already cached
    gameIds.forEach(id => {
      const cached = this.playlistCache.get(`game_${id}`);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        gameMap.set(id, cached.data);
      } else {
        uncachedIds.push(id);
      }
    });

    if (uncachedIds.length === 0) {
      return gameMap;
    }

    try {
      // First, try to fetch games from our database
      const { data: dbGames, error } = await this.supabase
        .from('games')
        .select('*')
        .in('id', uncachedIds);

      if (error) {
        console.error('Error fetching games from database:', error);
      } else if (dbGames && dbGames.length > 0) {
        // Add database games to the map
        dbGames.forEach(game => {
          const gameForPlaylist = {
            id: game.id,
            name: game.name,
            title: game.name,
            cover_url: game.cover_url,
            background_image: game.cover_url,
            first_release_date: game.first_release_date,
            platforms: game.platforms || [],
            genres: game.genres || [],
            rating: game.rating,
            source_id: game.source_id || game.id,
          };

          gameMap.set(game.id, gameForPlaylist);
          
          // Cache the game
          this.playlistCache.set(`game_${game.id}`, {
            data: gameForPlaylist,
            timestamp: Date.now()
          });
        });

        // Find which IDs still need fetching from external API
        const foundIds = dbGames.map(game => game.id);
        const stillUncachedIds = uncachedIds.filter(id => !foundIds.includes(id));
        
        // For any games not in our database, try UnifiedGameService as fallback
        if (stillUncachedIds.length > 0) {
          const BATCH_SIZE = 10;
          for (let i = 0; i < stillUncachedIds.length; i += BATCH_SIZE) {
            const batch = stillUncachedIds.slice(i, i + BATCH_SIZE);
            
            const batchResults = await Promise.allSettled(
              batch.map(async (gameId) => {
                try {
                  const game = await UnifiedGameService.getGameDetails(gameId);
                  if (game) {
                    const gameForPlaylist = { 
                      ...game, 
                      id: gameId,
                      source_id: game.source_id || gameId,
                    };
                    
                    this.playlistCache.set(`game_${gameId}`, {
                      data: gameForPlaylist,
                      timestamp: Date.now()
                    });
                    
                    return { id: gameId, game: gameForPlaylist };
                  }
                  return null;
                } catch (error) {
                  console.warn(`Failed to fetch game from API ${gameId}:`, error);
                  return null;
                }
              })
            );

            batchResults.forEach((result) => {
              if (result.status === 'fulfilled' && result.value) {
                gameMap.set(result.value.id, result.value.game);
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in batchFetchGameDetails:', error);
    }
    
    return gameMap;
  }

  /**
   * Clear all playlist-related caches
   */
  static clearCache(): void {
    this.playlistCache.clear();
    console.log('All playlist caches cleared');
  }

  /**
   * Invalidate playlist caches after CRUD operations
   * This ensures the explore page shows fresh data immediately
   */
  private static async invalidatePlaylistCaches(): Promise<void> {
    try {
      // Clear all playlist-related cache entries
      const keysToDelete: string[] = [];
      
      for (const [key] of this.playlistCache) {
        if (key.includes('playlist') || key.includes('featured') || key.includes('explore')) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => {
        this.playlistCache.delete(key);
      });

      console.log(`Invalidated ${keysToDelete.length} playlist cache entries`);

      // Also trigger a broadcast to notify other components
      this.broadcastCacheInvalidation();
    } catch (error) {
      console.error('Error invalidating playlist caches:', error);
    }
  }

  /**
   * Broadcast cache invalidation to components using playlists
   */
  private static broadcastCacheInvalidation(): void {
    // Use BroadcastChannel for cross-tab communication
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('playlist-updates');
        channel.postMessage({ 
          type: 'CACHE_INVALIDATED', 
          timestamp: Date.now() 
        });
        channel.close();
      } catch (error) {
        console.warn('BroadcastChannel not available:', error);
      }
    }

    // Also emit a custom event for same-tab components
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('playlist-cache-invalidated', {
          detail: { timestamp: Date.now() }
        }));
      } catch (error) {
        console.warn('CustomEvent not available:', error);
      }
    }
  }

  /**
   * Subscribe to real-time playlist changes
   * Automatically invalidates cache when playlists are modified
   */
  static subscribeToPlaylistChanges(): () => void {
    if (typeof window === 'undefined') {
      return () => {}; // No-op for server-side
    }

    const subscriptionKey = 'global_playlist_changes';
    
    // Don't create duplicate subscriptions
    if (this.subscriptions.has(subscriptionKey)) {
      return this.subscriptions.get(subscriptionKey);
    }

    console.log('Setting up real-time playlist subscription...');

    let debounceTimer: NodeJS.Timeout;
    
    const debouncedInvalidation = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        await this.invalidatePlaylistCaches();
      }, 1000); // 1 second debounce for global changes
    };

    const subscription = this.supabase
      .channel('playlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlists',
          filter: 'is_published=eq.true', // Only listen to published playlist changes
        },
        async (payload) => {
          console.log('Playlist change detected:', payload.eventType, (payload.new as any)?.title || (payload.old as any)?.title);
          debouncedInvalidation();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlist_games',
        },
        async (payload) => {
          console.log('Playlist games change detected:', payload.eventType);
          debouncedInvalidation();
        }
      )
      .subscribe();

    const unsubscribe = () => {
      console.log('Unsubscribing from playlist changes...');
      clearTimeout(debounceTimer);
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };

    this.subscriptions.set(subscriptionKey, unsubscribe);
    return unsubscribe;
  }

  /**
   * Get playlist by ID with full game details
   */
  static async getPlaylistById(id: string): Promise<Playlist> {
    try {
      const { data: playlist, error } = await this.supabase
        .from('playlists')
        .select(`
          *,
          playlist_games (
            game_id,
            display_order,
            added_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!playlist) throw new Error('Playlist not found');

      const gameIds = playlist.playlist_games.map((pg: DatabasePlaylistGame) => pg.game_id);
      const games = await Promise.all(
        gameIds.map(async (gameId: string) => {
          try {
            const game = await UnifiedGameService.getGameDetails(gameId);
            if (game) {
              return { ...game, id: gameId };
            }
            return null;
          } catch (error) {
            console.warn(`Failed to fetch game details for ID ${gameId}:`, error);
            return null;
          }
        })
      );

      const validGames = games.filter((game): game is NonNullable<typeof game> => game !== null);

      return {
        ...this.mapDatabasePlaylist(playlist as DatabasePlaylist),
        games: validGames.sort((a, b) => {
          const aOrder = playlist.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === a.id)?.display_order ?? 0;
          const bOrder = playlist.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === b.id)?.display_order ?? 0;
          return aOrder - bOrder;
        })
      };
    } catch (error) {
      console.error('Failed to fetch playlist by ID:', error);
      throw error;
    }
  }

  /**
   * Get playlists by type/category
   */
  static async getPlaylistsByType(type: PlaylistType): Promise<Playlist[]> {
    try {
      const { data: playlists, error } = await this.supabase
        .from('playlists')
        .select(`
          *,
          playlist_games (
            game_id,
            display_order,
            added_at
          )
        `)
        .eq('type', type)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return Promise.all(
        playlists.map(async (playlist: DatabasePlaylist) => {
          const gameIds = playlist.playlist_games.map((pg: DatabasePlaylistGame) => pg.game_id);
          const games = await Promise.all(
            gameIds.slice(0, 5).map(async (gameId: string) => { // Only load first 5 for performance
              try {
                const game = await UnifiedGameService.getGameDetails(gameId);
                if (game) {
                  return { ...game, id: gameId };
                }
                return null;
              } catch (error) {
                console.warn(`Failed to fetch game details for ID ${gameId}:`, error);
                return null;
              }
            })
          );

          const validGames = games.filter((game): game is NonNullable<typeof game> => game !== null);

          return {
            ...this.mapDatabasePlaylist(playlist),
            games: validGames.sort((a, b) => {
              const aOrder = playlist.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === a.id)?.display_order ?? 0;
              const bOrder = playlist.playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === b.id)?.display_order ?? 0;
              return aOrder - bOrder;
            })
          };
        })
      );
    } catch (error) {
      console.error(`Failed to fetch playlists by type ${type}:`, error);
      throw error;
    }
  }

  /**
   * Warm up the cache with featured playlists
   * Can be called on app initialization for better performance
   */
  static async warmUpCache(): Promise<void> {
    try {
      console.log('Warming up playlist cache...');
      await this.getFeaturedPlaylists(10);
      console.log('Playlist cache warmed up successfully');
    } catch (error) {
      console.warn('Failed to warm up playlist cache:', error);
    }
  }
} 