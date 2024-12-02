import { GameApiResponse, GameReview, Game, Platform } from "@/types/game";

export const fetchGameDetails = async (gameId: string, reviews: GameReview[]) => {
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
  const review = reviews.find((r) => r.game_id === gameId);

  return {
    id: gameId,
    name: gameData.name,
    cover: gameData.cover ? { 
      url: gameData.cover.url.startsWith("//") 
        ? `https:${gameData.cover.url}` 
        : gameData.cover.url 
    } : null,
    platforms: gameData.platforms?.map((p: Platform | string) => ({
      id: typeof p === "string" ? parseInt(p) : p.id,
      name: typeof p === "string" ? p : p.name,
    })) || [],
    review: review
      ? {
          rating: review.rating,
          text: review.review_text,
        }
      : undefined,
    // Include other game details
    summary: gameData.summary,
    storyline: gameData.storyline,
    total_rating: gameData.total_rating,
  } as Game;
};

export const fetchUserGames = async (supabase: any, { start, end }: { start: number; end: number }) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return { userGames: [], reviews: [] };

  const { data: userGames, error: userGamesError } = await supabase
    .from("user_games")
    .select("*")
    .eq("user_id", user.id)
    .range(start, end);
  
  if (userGamesError) throw userGamesError;

  const { data: reviews, error: reviewsError } = await supabase
    .from("game_reviews")
    .select("*")
    .eq("user_id", user.id);
    
  if (reviewsError) throw reviewsError;

  console.log("Fetched games from database:", userGames); // Debug log
  return { userGames, reviews };
};