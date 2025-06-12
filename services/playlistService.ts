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
          start_date: input.startDate,
          end_date: input.endDate,
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
          throw new Error('Failed to associate games with playlist');
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
      ...(input.startDate && { start_date: input.startDate }),
      ...(input.endDate && { end_date: input.endDate }),
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

      if (gameError) throw gameError;
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
} 