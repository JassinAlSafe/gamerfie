import { createClient } from "@/utils/supabase/client";
import { Playlist, CreatePlaylistInput, UpdatePlaylistInput, PlaylistType } from '@/types/playlist';
import { UnifiedGameService } from './unifiedGameService';
import { GameIdMappingService } from './gameIdMappingService';
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

  static async createPlaylist(input: CreatePlaylistInput): Promise<Playlist> {
    try {
      const user = useAuthStore.getState().user;
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

    return this.mapDatabasePlaylist(playlist);
  }

  static async getPlaylist(id: string): Promise<Playlist | null> {
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
    if (!playlist) return null;

    // Fetch games data using unified service for better covers and metadata
    const gameIds = (playlist as DatabasePlaylist).playlist_games.map((pg: DatabasePlaylistGame) => pg.game_id);
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
      ...this.mapDatabasePlaylist(playlist as DatabasePlaylist),
      games: validGames.sort((a, b) => {
        const aOrder = (playlist as DatabasePlaylist).playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === a.id)?.display_order ?? 0;
        const bOrder = (playlist as DatabasePlaylist).playlist_games.find((pg: DatabasePlaylistGame) => pg.game_id === b.id)?.display_order ?? 0;
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
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data: playlists, error } = await query;

      if (error) {
        console.error('Error fetching playlists:', error);
        throw error;
      }

      if (!playlists) {
        return [];
      }

      // Return simplified playlist data without fetching all game details for admin dashboard
      return playlists.map((playlist: DatabasePlaylist) => ({
        ...this.mapDatabasePlaylist(playlist),
        gameIds: playlist.playlist_games.map((pg: DatabasePlaylistGame) => pg.game_id),
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
              
              return {
                id: gameId,
                name: gameData.name || 'Unknown Game',
                cover_url: gameData.background_image || gameData.cover_url || null,
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
  }

  static subscribeToPlaylist(playlistId: string, callback: (playlist: Playlist) => void) {
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
        async () => {
          const playlist = await this.getPlaylist(playlistId);
          if (playlist) {
            callback(playlist);
          }
        }
      )
      .subscribe();

    return () => {
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
        return Array.isArray(cached.data) ? cached.data : [cached.data];
      }

      // First, get the playlists
      const { data: playlists, error: playlistError } = await this.supabase
        .from('playlists')
        .select('*')
        .eq('is_published', true)
        .eq('type', 'featured')
        .order('display_order', { ascending: true })
        .limit(limit);

      if (playlistError) throw playlistError;

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
        playlist_games: playlistGames.filter(pg => pg.playlist_id === playlist.id)
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

        const result = {
          ...this.mapDatabasePlaylist(playlist),
          games
        };
        
        return result;
      });



      // Cache the result
      this.playlistCache.set(cacheKey, {
        data: processedPlaylists as any,
        timestamp: Date.now()
      });

      return processedPlaylists;
    } catch (error) {
      console.error('🔍 DEBUGGING: Failed to fetch featured playlists:', error);
      return [];
    }
  }

  /**
   * Batch fetch game details with caching, RAWG-to-IGDB conversion, and fallback handling
   */
  private static async batchFetchGameDetails(gameIds: string[]): Promise<Map<string, any>> {
    const gameMap = new Map();
    const uncachedIds: string[] = [];

    console.log(`🔍 DEBUGGING: BatchFetchGameDetails called with ${gameIds.length} game IDs:`, gameIds);

    // Check what's already cached
    gameIds.forEach(id => {
      const cached = this.playlistCache.get(`game_${id}`);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        gameMap.set(id, cached.data);
        console.log(`🔍 DEBUGGING: Found cached game: ${id}`);
      } else {
        uncachedIds.push(id);
        console.log(`🔍 DEBUGGING: Game not cached: ${id}`);
      }
    });

    if (uncachedIds.length === 0) {
      console.log('🔍 DEBUGGING: All games found in cache');
      return gameMap;
    }

    console.log(`🔍 DEBUGGING: Fetching ${uncachedIds.length} uncached games:`, uncachedIds);

    // ARCHITECTURE FIX: Convert RAWG IDs to IGDB IDs for consistent data
    const convertedIds = new Map<string, string>(); // original -> converted
    for (const originalId of uncachedIds) {
      if (originalId.startsWith('rawg_')) {
        console.log(`🔄 DEBUGGING: Converting RAWG ID to IGDB: ${originalId}`);
        
        // Check for manual mapping first
        const manualMapping = GameIdMappingService.getManualMapping(originalId);
        if (manualMapping) {
          convertedIds.set(originalId, manualMapping);
          console.log(`✅ DEBUGGING: Manual mapping found: ${originalId} -> ${manualMapping}`);
        } else {
          // Try automatic conversion
          const igdbId = await GameIdMappingService.convertRawgToIgdb(originalId);
          convertedIds.set(originalId, igdbId || originalId);
          console.log(`🔄 DEBUGGING: Auto conversion: ${originalId} -> ${igdbId || 'failed'}`);
        }
      } else {
        convertedIds.set(originalId, originalId);
      }
    }

    console.log(`🔍 DEBUGGING: ID conversion complete. Processing ${convertedIds.size} games...`);

    // First, try to fetch games from our database using converted IDs
    try {
      const allIdsToQuery = Array.from(new Set([...uncachedIds, ...convertedIds.values()]));
      console.log(`🔍 DEBUGGING: Querying database for games with IDs: [${allIdsToQuery.join(', ')}]`);
      
      const { data: dbGames, error } = await this.supabase
        .from('games')
        .select('*')
        .in('id', allIdsToQuery);

      if (error) {
        console.error('🔍 DEBUGGING: Error fetching games from database:', error);
      } else if (dbGames && dbGames.length > 0) {
        console.log(`🔍 DEBUGGING: Found ${dbGames.length} games in database:`);
        dbGames.forEach(game => {
          console.log(`🔍 DEBUGGING:   - Database game: ${game.name} (ID: ${game.id})`);
        });
        
        dbGames.forEach(game => {
          const gameForPlaylist = {
            id: game.id,
            name: game.name,
            title: game.name, // Ensure title is set for compatibility
            cover_url: game.cover_url,
            background_image: game.cover_url, // Map cover_url to background_image for compatibility
            first_release_date: game.first_release_date,
            platforms: game.platforms || [],
            genres: game.genres || [],
            rating: game.rating,
            source_id: game.source_id || game.id,
            playlist_id: game.id
          };

          // For each original game ID that was requested, check if this database game matches
          uncachedIds.forEach(originalId => {
            const convertedId = convertedIds.get(originalId) || originalId;
            if (convertedId === game.id) {
              console.log(`🔗 DEBUGGING: Mapping ${originalId} -> ${convertedId} to game: ${game.name}`);
              
              // Add the game with the original ID for playlist compatibility
              gameMap.set(originalId, gameForPlaylist);
              
              // Cache the game
              this.playlistCache.set(`game_${originalId}`, {
                data: gameForPlaylist,
                timestamp: Date.now()
              });
            }
          });
          
          console.log(`🔍 DEBUGGING: Added database game to map: ${game.name} with ID: ${game.id}`);
        });

        // Find which original IDs still need fetching
        const foundConvertedIds = dbGames.map(game => game.id);
        const stillUncachedOriginalIds = uncachedIds.filter(originalId => {
          const convertedId = convertedIds.get(originalId);
          return !foundConvertedIds.includes(convertedId!);
        });
        
        console.log(`🔍 DEBUGGING: Still need to fetch from external API: ${stillUncachedOriginalIds.length} games:`, stillUncachedOriginalIds);

        // For any games not in our database, try UnifiedGameService as fallback
        if (stillUncachedOriginalIds.length > 0) {
          const BATCH_SIZE = 10;
          const batches = [];
          for (let i = 0; i < stillUncachedOriginalIds.length; i += BATCH_SIZE) {
            batches.push(stillUncachedOriginalIds.slice(i, i + BATCH_SIZE));
          }

          for (const batch of batches) {
            console.log(`🔍 DEBUGGING: Processing batch of ${batch.length} games:`, batch);
            
            const batchResults = await Promise.allSettled(
              batch.map(async (originalId) => {
                try {
                  const convertedId = convertedIds.get(originalId) || originalId;
                  console.log(`🔍 DEBUGGING: Fetching game details from API for ${originalId} (converted: ${convertedId})`);
                  
                  const game = await UnifiedGameService.getGameDetails(convertedId);
                  if (game) {
                    console.log(`🔍 DEBUGGING: Successfully fetched game from API: ${game.name} (${originalId} -> ${convertedId})`);
                    
                    const gameForPlaylist = { 
                      ...game, 
                      id: originalId, // Use original ID for playlist compatibility
                      source_id: game.source_id || convertedId,
                      playlist_id: originalId
                    };
                    
                    this.playlistCache.set(`game_${originalId}`, {
                      data: gameForPlaylist,
                      timestamp: Date.now()
                    });
                    
                    return { id: originalId, game: gameForPlaylist };
                  } else {
                    console.warn(`🔍 DEBUGGING: UnifiedGameService returned null for game ID: ${originalId} (${convertedId})`);
                    return null;
                  }
                } catch (error) {
                  console.error(`🔍 DEBUGGING: Failed to fetch game from API ${originalId}:`, error);
                  return null;
                }
              })
            );

            batchResults.forEach((result, index) => {
              const originalId = batch[index];
              if (result.status === 'fulfilled' && result.value) {
                gameMap.set(result.value.id, result.value.game);
                console.log(`🔍 DEBUGGING: Added API game to map: ${result.value.game.name} with ID: ${result.value.id}`);
              } else {
                console.warn(`🔍 DEBUGGING: Failed to process API game ${originalId}:`, result.status === 'rejected' ? result.reason : 'null result');
              }
            });
          }
        }
      } else {
        console.log(`🔍 DEBUGGING: No games found in database, trying external APIs for all ${uncachedIds.length} games`);
      }
    } catch (error) {
      console.error('🔍 DEBUGGING: Error in batchFetchGameDetails:', error);
    }

    console.log(`🔍 DEBUGGING: BatchFetchGameDetails completed. Returning ${gameMap.size} games`);
    gameMap.forEach((game, id) => {
      console.log(`🔍 DEBUGGING: Final game map - ${id}: ${game.name}`);
    });
    
    return gameMap;
  }

  /**
   * Clear playlist cache
   */
  static clearCache(): void {
    this.playlistCache.clear();
  }

  /**
   * Get cache stats for debugging
   */
  static getCacheStats() {
    return {
      size: this.playlistCache.size,
      keys: Array.from(this.playlistCache.keys())
    };
  }
} 