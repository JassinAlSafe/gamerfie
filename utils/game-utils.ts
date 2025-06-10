import { createClient } from '@/utils/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Game } from '@/types/game';
import { useGameDetailsStore } from '@/stores/useGameDetailsStore';

export interface GameStats {
  total_played: number;
  backlog: number;
  currentlyPlaying: number;
  completedGames: number;
  droppedGames: number;
}

// Helper function to normalize game data for store
const normalizeGameForStore = (game: any): Game => {
  return {
    ...game,
    // Ensure cover is properly structured
    cover: typeof game.cover === 'string' 
      ? { id: game.cover, url: game.cover }
      : game.cover,
    // Ensure all required properties exist with defaults
    summary: game.summary || '',
    storyline: game.storyline || '',
    total_rating_count: game.total_rating_count || 0,
  } as Game;
};


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
    
    // Add fetched games to store with proper normalization
    fetchedGames.forEach((game: any) => {
      if (game && game.id) {
        const normalizedGame = normalizeGameForStore(game);
        store.setGame(normalizedGame as any);
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
  userId: string
) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId provided');
  }

  // Use the query wrapper for user_games queries
  const { SupabaseQueryWrapper } = await import('@/utils/supabase/query-wrapper');
  const { data, error } = await SupabaseQueryWrapper.queryUserGames(userId, undefined, {
    select: `
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
    `
  });

  if (error) {
    console.warn('Error fetching user games:', error);
    return [];
  }

  return (data as any[])?.map((userGame: any) => ({
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

  data.forEach((game: { status: string | null }) => {
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


export const removeGameFromLibrary = async (
  gameId: string,
  userId: string
) => {
  const supabase = createClient();

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
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First check if the game exists in the games table
    const { data: gameExists } = await supabase
      .from('games')
      .select('id')
      .eq('id', gameId)
      .maybeSingle();

    // If game doesn't exist in games table, user definitely doesn't have it in library
    if (!gameExists) {
      return null;
    }

    // Use the query wrapper for user_games queries
    const { SupabaseQueryWrapper } = await import('@/utils/supabase/query-wrapper');
    const result = await SupabaseQueryWrapper.checkUserGame(userId, gameId);
    return result;
  } catch (error) {
    console.error('Error checking game in library:', error);
    return null;
  }
};

export const formatRating = (rating: number | null | undefined): string => {
  if (!rating || rating === 0) return ''; // Return empty string for no rating
  return rating.toFixed(1);
};
