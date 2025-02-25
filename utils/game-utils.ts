import type { Game, GameStats } from "@/types/index";
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { useGameDetailsStore } from '@/stores/useGameDetailsStore';

export const fetchGameDetails = async (gameIds: string[]) => {
  try {
    console.log('Fetching game details for IDs:', gameIds);
    
    // Get store instance
    const store = useGameDetailsStore.getState();
    
    // Check cache first
    const cachedGames = gameIds
      .map(id => store.getGame(Number(id)))
      .filter(game => game && Date.now() - game.timestamp < 1000 * 60 * 60); // 1 hour cache
    
    // Find IDs that need fetching
    const idsToFetch = gameIds.filter(id => 
      !cachedGames.find(game => game?.id === id)
    );
    
    if (idsToFetch.length === 0) {
      console.log('All games found in cache');
      return cachedGames.map(game => ({ ...game, timestamp: undefined }));
    }
    
    console.log('Fetching missing games:', idsToFetch);
    
    const response = await fetch('/api/games/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: idsToFetch })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error response from /api/games/details:', error);
      throw new Error(`Failed to fetch game details: ${error}`);
    }

    const fetchedGames = await response.json();
    
    // Add fetched games to store
    fetchedGames.forEach((game: Game) => {
      if (game && game.id) {
        store.setGame(game);
      }
    });
    
    // Return combined results
    const allGames = gameIds
      .map(id => store.getGame(Number(id)))
      .filter(game => game)
      .map(game => ({ ...game, timestamp: undefined }));
    
    if (allGames.length !== gameIds.length) {
      console.warn(
        `Received ${allGames.length} valid games out of ${gameIds.length} requested:`,
        allGames.map(g => g.id)
      );
    }

    return allGames;
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
  
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId provided');
  }

  type DbGame = Database['public']['Tables']['games']['Row'];
  type DbUserGame = Database['public']['Tables']['user_games']['Row'] & {
    games: DbGame;
  };

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
      completion_percentage,
      achievements_completed,
      games (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data as unknown as DbUserGame[])?.map(userGame => ({
    id: userGame.games.id,
    name: userGame.games.name,
    cover: userGame.games.cover_url ? {
      url: userGame.games.cover_url
    } : undefined,
    rating: userGame.games.rating || 0,
    first_release_date: userGame.games.first_release_date,
    platforms: userGame.games.platforms || [],
    genres: userGame.games.genres || [],
    summary: userGame.games.summary || '',
    status: userGame.status,
    playTime: userGame.play_time,
    userRating: userGame.user_rating,
    completedAt: userGame.completed_at,
    lastPlayedAt: userGame.last_played_at,
    completionPercentage: userGame.completion_percentage,
    achievementsCompleted: userGame.achievements_completed,
    notes: userGame.notes
  })) || [];
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

  type GameStatus = { status: string | null };
  data.forEach((game: GameStatus) => {
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

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_games')
      .select('status')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error checking game in library:', error);
    return null;
  }
};

export const formatRating = (rating: number | null | undefined): string => {
  if (!rating || rating === 0) return ''; // Return empty string for no rating
  return rating.toFixed(1);
};
