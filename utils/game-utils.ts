import { GameApiResponse, GameReview, Game, UserGame, Platform } from "@/types/index";
import { SupabaseClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const fetchGameDetails = async (gameIds: string[]) => {
  try {
    console.log('Fetching game details for IDs:', gameIds);
    
    const response = await fetch('/api/games/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: gameIds })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error response from /api/games/details:', error);
      throw new Error(`Failed to fetch game details: ${error}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn('No game details returned for IDs:', gameIds);
      return [];
    }

    // Filter out any undefined/null entries
    const validGames = data.filter(game => game && game.id);
    
    if (validGames.length !== gameIds.length) {
      console.warn(
        `Received ${validGames.length} valid games out of ${gameIds.length} requested:`,
        validGames.map(g => g.id)
      );
    }

    return validGames;
  } catch (error) {
    console.error('Error in fetchGameDetails:', error);
    throw error;
  }
};

export const fetchUserGames = async (params: { 
  userId: string, 
  start: number, 
  end: number,
  supabase?: SupabaseClient
}): Promise<ProcessedGame[]> => {
  try {
    const supabaseClient = params.supabase || createClientComponentClient();
    
    const { data: userGames, error } = await supabaseClient
      .from('user_games')
      .select(`
        game_id,
        status,
        play_time,
        user_rating,
        completed_at,
        notes,
        last_played_at,
        games (
          id,
          name,
          cover,
          rating,
          first_release_date,
          platforms,
          genres,
          summary,
          storyline
        )
      `)
      .eq('user_id', params.userId)
      .range(params.start, params.end)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!userGames?.length) return [];

    return userGames.map(userGame => ({
      ...userGame.games,
      status: userGame.status,
      playTime: userGame.play_time,
      userRating: userGame.user_rating,
      completedAt: userGame.completed_at,
      lastPlayedAt: userGame.last_played_at,
      notes: userGame.notes
    })).filter(Boolean) as ProcessedGame[];

  } catch (error) {
    console.error('Error in fetchUserGames:', error);
    throw error;
  }
};

export const updateGameStatus = async (
  supabase: SupabaseClient,
  gameId: string,
  newStatus: string,
  userId: string
) => {
  const { data, error } = await supabase
    .from('user_games')
    .update({ status: newStatus })
    .eq('user_id', userId) // Ensure we update the game for the specific user
    .eq('game_id', gameId);

  if (error) {
    throw error;
  }

  return data;
};

export const fetchUserStats = async (
  supabase: SupabaseClient,
  userId: string
): Promise<GameStats> => {
  const { data, error } = await supabase
    .from('user_games')
    .select('status', { count: 'exact' })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  const stats = {
    total_played: 0,
    backlog: 0,
    currentlyPlaying: 0,
    completedGames: 0,
    droppedGames: 0,
  };

  data.forEach((game: any) => {
    switch (game.status) {
      case 'playing':
        stats.currentlyPlaying += 1;
        break;
      case 'completed':
        stats.completedGames += 1;
        break;
      case 'want_to_play':
        stats.backlog += 1;
        break;
      case 'dropped':
        stats.droppedGames += 1;
        break;
    }
    stats.total_played += 1;
  });

  return stats;
};

export const addGame = async (game: Game, userId: string) => {
  const supabase = createClientComponentClient();

  try {
    console.log('Adding game:', game);

    // First, insert or update the game in games table
    const { error: gameError } = await supabase
      .from('games')
      .upsert({
        id: game.id,
        name: game.name,
        cover: game.cover ? {
          id: game.cover.id,
          url: game.cover.url.startsWith('//') 
            ? `https:${game.cover.url.replace('t_thumb', 't_1080p').replace('t_micro', 't_1080p')}` 
            : game.cover.url.replace('t_thumb', 't_1080p').replace('t_micro', 't_1080p')
        } : null,
        rating: game.rating || 0,
        first_release_date: game.first_release_date,
        platforms: game.platforms?.map(p => ({
          id: p.id,
          name: p.name
        })) || [],
        genres: game.genres?.map(g => ({
          id: g.id,
          name: g.name
        })) || [],
        summary: game.summary || '',
        storyline: game.storyline || ''
      }, { 
        onConflict: 'id' 
      });

    if (gameError) {
      console.error('Error inserting game:', gameError);
      throw gameError;
    }

    // Then create the user-game relationship
    const { error: userGameError } = await supabase
      .from('user_games')
      .upsert({
        user_id: userId,
        game_id: game.id,
        status: 'want_to_play',
        created_at: new Date().toISOString()
      });

    if (userGameError) {
      console.error('Error creating user-game relationship:', userGameError);
      throw userGameError;
    }

    return game;
  } catch (error) {
    console.error('Error adding game:', error);
    throw error;
  }
};
