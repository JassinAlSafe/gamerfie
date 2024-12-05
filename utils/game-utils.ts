import { GameApiResponse, GameReview, Game, UserGame, Platform } from "@/types/index";
import { SupabaseClient } from '@supabase/supabase-js';

export const fetchGameDetails = async (gameId: string): Promise<Game> => {
  const requestBody = { gameId: parseInt(gameId, 10) };
  const response = await fetch("/api/games/details", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch game details");
  }

  const gameData: GameApiResponse = await response.json();

  return {
    id: gameId,
    name: gameData.name,
    cover: gameData.cover ? {
      url: gameData.cover.url.startsWith("//")
        ? `https:${gameData.cover.url}`
        : gameData.cover.url
    } : undefined,
    platforms: gameData.platforms?.map((p: Platform | string) => ({
      id: typeof p === "string" ? parseInt(p, 10) : p.id,
      name: typeof p === "string" ? p : p.name,
    })) || [],
    summary: gameData.summary,
    storyline: gameData.storyline,
    total_rating: gameData.total_rating,
    status: 'want_to_play', // Default status, should be updated with actual user status
    user_id: '', // This should be filled with the actual user ID
    updated_at: new Date().toISOString(), // This should be updated with the actual last update time
  };
};

export async function fetchUserGames({
  supabase,
  start,
  end,
  userId
}: {
  supabase: SupabaseClient;
  start: number;
  end: number;
  userId: string
}) {
  console.log('Fetching user games with params:', { start, end, userId });

  try {
    const { data: userGames, error: gamesError } = await supabase
      .from('user_games')
      .select('*')
      .eq('user_id', userId)
      .range(start, end)
      .order('created_at', { ascending: false });

    if (gamesError) {
      console.error('Error fetching user games:', gamesError);
      throw gamesError;
    }

    console.log('User games response:', userGames);

    let reviews: GameReview[] = [];
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId);

      if (reviewsError) {
        if (reviewsError.code === '42P01') {
          console.warn('Reviews table does not exist. Skipping review fetch.');
        } else {
          console.error('Error fetching reviews:', reviewsError);
        }
      } else {
        reviews = reviewsData as GameReview[];
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }

    // Fetch game details for each user game
    const gamesWithDetails = await Promise.all(
      (userGames as UserGame[]).map(async (game) => {
        const gameDetails = await fetchGameDetails(game.game_id);
        return { ...game, ...gameDetails };
      })
    );

    return {
      userGames: gamesWithDetails,
      reviews: reviews,
      hasMore: (userGames || []).length === (end - start + 1)
    };
  } catch (error) {
    console.error('Error in fetchUserGames:', error);
    throw error;
  }
}

