import { GameApiResponse, GameReview, Game, UserGame, Platform } from "@/types/index";
import { SupabaseClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase';

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

export const fetchUserGames = async (
  userId: string,
  offset = 0,
  limit = 24
) => {
  const supabase = createClientComponentClient<Database>();
  
  // Validate userId
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId provided');
  }

  const { data, error } = await supabase
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
        cover_url,
        rating,
        first_release_date,
        platforms,
        genres,
        summary,
        storyline
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error in fetchUserGames:', error);
    throw error;
  }

  return data?.map(userGame => ({
    ...userGame.games,
    cover: userGame.games?.cover_url ? {
      url: userGame.games.cover_url
    } : undefined,
    status: userGame.status,
    playTime: userGame.play_time,
    userRating: userGame.user_rating,
    completedAt: userGame.completed_at,
    lastPlayedAt: userGame.last_played_at,
    notes: userGame.notes
  }));
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

    // Return both the game and a success flag for the UI to handle
    return { game, success: true };
  } catch (error) {
    console.error('Error adding game:', error);
    throw error;
  }
};

export const addGameToLibrary = async (
  gameId: string,
  userId: string,
  initialStatus: string = 'want_to_play'
) => {
  const supabase = createClientComponentClient<Database>();

  // First check if the game exists in our games table
  const { data: existingGame } = await supabase
    .from('games')
    .select('id')
    .eq('id', gameId)
    .single();

  // If game doesn't exist in our database, fetch and insert it
  if (!existingGame) {
    const response = await fetch(`/api/games/details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [gameId] })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch game details');
    }
  }

  // Add the game to user's library
  const { data, error } = await supabase
    .from('user_games')
    .upsert({
      user_id: userId,
      game_id: gameId,
      status: initialStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  return data;
};

export const removeGameFromLibrary = async (
  gameId: string,
  userId: string
) => {
  const supabase = createClientComponentClient<Database>();

  const { error } = await supabase
    .from('user_games')
    .delete()
    .eq('user_id', userId)
    .eq('game_id', gameId);

  if (error) throw error;
};

export const checkGameInLibrary = async (
  gameId: string,
  userId: string
) => {
  const supabase = createClientComponentClient<Database>();

  const { data, error } = await supabase
    .from('user_games')
    .select('status')
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
};

export const formatRating = (rating: number | null | undefined): string => {
  if (!rating || rating === 0) return ''; // Return empty string for no rating
  return rating.toFixed(1);
};
