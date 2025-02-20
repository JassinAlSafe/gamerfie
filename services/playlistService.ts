import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Playlist, CreatePlaylistInput, UpdatePlaylistInput, PlaylistGame } from '@/types/playlist';
import { RAWGService } from './rawgService';

export class PlaylistService {
  private static supabase = createClientComponentClient<Database>();

  static async createPlaylist(input: CreatePlaylistInput): Promise<Playlist> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Check admin status first
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist
          const { error: insertError } = await this.supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            throw new Error('Failed to create admin profile');
          }
        } else {
          throw new Error('Failed to verify admin status');
        }
      } else if (profile?.role !== 'admin') {
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
          created_by: session.user.id,
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

    // Fetch games data from RAWG
    const gameIds = playlist.playlist_games.map(pg => pg.game_id);
    const games = await Promise.all(
      gameIds.map(id => RAWGService.getGameDetails(id))
    );

    return {
      ...this.mapDatabasePlaylist(playlist),
      games: games.sort((a, b) => {
        const aOrder = playlist.playlist_games.find(pg => pg.game_id === a.id)?.display_order ?? 0;
        const bOrder = playlist.playlist_games.find(pg => pg.game_id === b.id)?.display_order ?? 0;
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
      playlists.map(async (playlist) => {
        const gameIds = playlist.playlist_games.map(pg => pg.game_id);
        const games = await Promise.all(
          gameIds.map(id => RAWGService.getGameDetails(id))
        );

        return {
          ...this.mapDatabasePlaylist(playlist),
          games: games.sort((a, b) => {
            const aOrder = playlist.playlist_games.find(pg => pg.game_id === a.id)?.display_order ?? 0;
            const bOrder = playlist.playlist_games.find(pg => pg.game_id === b.id)?.display_order ?? 0;
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

  private static mapDatabasePlaylist(dbPlaylist: any): Playlist {
    return {
      id: dbPlaylist.id,
      title: dbPlaylist.title,
      description: dbPlaylist.description,
      coverImage: dbPlaylist.cover_image,
      type: dbPlaylist.type,
      slug: dbPlaylist.slug,
      isPublished: dbPlaylist.is_published,
      startDate: dbPlaylist.start_date,
      endDate: dbPlaylist.end_date,
      createdAt: dbPlaylist.created_at,
      updatedAt: dbPlaylist.updated_at,
      createdBy: dbPlaylist.created_by,
      gameIds: (dbPlaylist.playlist_games || []).map((pg: PlaylistGame) => pg.gameId),
      order: dbPlaylist.display_order,
      metadata: dbPlaylist.metadata
    };
  }
} 