import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Playlist, CreatePlaylistInput, UpdatePlaylistInput, PlaylistGame } from '@/types/playlist';
import { RAWGService } from './rawgService';

export class PlaylistService {
  private static supabase = createClientComponentClient<Database>();

  static async createPlaylist(input: CreatePlaylistInput, userId: string): Promise<Playlist> {
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
        created_by: userId,
        slug,
        metadata: input.metadata
      })
      .select()
      .single();

    if (error) throw error;

    if (input.gameIds?.length) {
      const playlistGames = input.gameIds.map((gameId, index) => ({
        playlist_id: playlist.id,
        game_id: gameId,
        order: index,
        added_at: new Date().toISOString()
      }));

      const { error: gameError } = await this.supabase
        .from('playlist_games')
        .insert(playlistGames);

      if (gameError) throw gameError;
    }

    return this.mapDatabasePlaylist(playlist);
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
        order: index,
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
          order,
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
        const aOrder = playlist.playlist_games.find(pg => pg.game_id === a.id)?.order ?? 0;
        const bOrder = playlist.playlist_games.find(pg => pg.game_id === b.id)?.order ?? 0;
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
          order,
          added_at
        )
      `)
      .eq('is_published', true)
      .order('order', { ascending: true });

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
            const aOrder = playlist.playlist_games.find(pg => pg.game_id === a.id)?.order ?? 0;
            const bOrder = playlist.playlist_games.find(pg => pg.game_id === b.id)?.order ?? 0;
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
      order: dbPlaylist.order,
      metadata: dbPlaylist.metadata
    };
  }
} 