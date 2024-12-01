"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/utils/supabase-client";
import { GameCard, type GameStatus } from "./game-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Plus, Gamepad2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { type Game } from "@/types";
import { useQuery, useMutation, useQueryClient } from "react-query";

interface GamesTabProps {
  onGamesUpdate: (_games: Game[]) => void;
}

const GAMES_PER_PAGE = 12;

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Oops! Something went wrong.</h2>
      <p className="mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </Card>
  );
}

interface GameApiPlatform {
  id: number;
  name: string;
}

interface GameApiCover {
  id: number;
  url: string;
}

interface GameApiResponse {
  id: string;
  name: string;
  cover?: GameApiCover;
  platforms?: Array<GameApiPlatform | string>;
}

interface UserGame {
  game_id: string;
  user_id: string;
  status: GameStatus;
  updated_at: string;
}

interface GameReview {
  game_id: string;
  rating: number;
  review_text: string;
}

const fetchGameDetails = async (gameId: string, reviews: GameReview[]) => {
  const requestBody = { gameId: parseInt(gameId, 10) };
  console.log("Requesting game details with payload:", requestBody);

  const response = await fetch("/api/games/details", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  console.log("Response status:", response.status);
  const responseBody = await response.text();
  console.log("Response body:", responseBody);

  if (!response.ok) {
    console.error("Failed to fetch game details:", responseBody);
    throw new Error("Failed to fetch game details");
  }

  const gameData: GameApiResponse = JSON.parse(responseBody);
  console.log("Fetched game details:", gameData);

  const review = reviews.find((r) => r.game_id === gameId);

  return {
    id: gameId,
    name: gameData.name,
    cover: gameData.cover ? { url: gameData.cover.url } : undefined,
    platforms: gameData.platforms?.map((p: GameApiPlatform | string) => ({
      id: typeof p === "string" ? parseInt(p) : p.id,
      name: typeof p === "string" ? p : p.name,
    })),
    review: review
      ? {
          rating: review.rating,
          text: review.review_text,
        }
      : undefined,
  } as Game;
};

const fetchUserGames = async (supabase: any) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return { userGames: [], reviews: [] };

  console.log("Fetched user:", user);

  const { data: userGames, error: userGamesError } = await supabase
    .from("user_games")
    .select("*")
    .eq("user_id", user.id);

  if (userGamesError) throw userGamesError;

  console.log("Fetched user games:", userGames);

  const { data: reviews, error: reviewsError } = await supabase
    .from("game_reviews")
    .select("*")
    .eq("user_id", user.id);

  if (reviewsError) throw reviewsError;

  console.log("Fetched reviews:", reviews);

  return { userGames, reviews };
};

interface UpdateGameStatusData {
  gameId: string;
  status: string;
}

interface ReviewUpdateData {
  gameId: string;
  rating: number;
  reviewText: string;
}

export function GamesTab({ onGamesUpdate }: GamesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [games, setGames] = useState<Game[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<any, { message: string }>(
    "userGames",
    () => fetchUserGames(supabase),
    {
      onSuccess: (data) => {
        const gameDetailsPromises = (data.userGames as UserGame[]).map(
          async (ug) => {
            try {
              return await fetchGameDetails(
                ug.game_id,
                data.reviews as GameReview[]
              );
            } catch (error) {
              console.error(
                `Error fetching details for game ${ug.game_id}:`,
                error
              );
              return {
                id: ug.game_id,
                user_id: ug.user_id,
                name: `Game ${ug.game_id}`,
                status: ug.status,
                updated_at: ug.updated_at,
              } as Game;
            }
          }
        );

        Promise.all(gameDetailsPromises).then((gamesWithDetails) => {
          setGames(gamesWithDetails);
          onGamesUpdate(gamesWithDetails);
        });
      },
    }
  );

  const updateGameStatus = useMutation<
    UpdateGameStatusData,
    Error,
    UpdateGameStatusData
  >(
    async ({ gameId, status }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_games")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("game_id", gameId);

      if (error) throw error;
      return { gameId, status };
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData("userGames", (oldData: any) => {
          const updatedGames = oldData.userGames.map((game: UserGame) =>
            game.game_id === data.gameId
              ? {
                  ...game,
                  status: data.status,
                  updated_at: new Date().toISOString(),
                }
              : game
          );
          return { ...oldData, userGames: updatedGames };
        });
        queryClient.invalidateQueries("gameStats");
        toast.success("Game status updated");
      },
      onError: (error) => {
        console.error("Error updating game status:", error);
        toast.error("Failed to update game status");
      },
    }
  );

  const removeFromLibrary = useMutation<string, Error, string>(
    async (gameId) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_games")
        .delete()
        .eq("user_id", user.id)
        .eq("game_id", gameId);

      if (error) throw error;
      return gameId;
    },
    {
      onSuccess: (gameId) => {
        queryClient.setQueryData("userGames", (oldData: any) => {
          const updatedGames = oldData.userGames.filter(
            (game: UserGame) => game.game_id !== gameId
          );
          return { ...oldData, userGames: updatedGames };
        });
        queryClient.invalidateQueries("gameStats");
        toast.success("Game removed from library");
      },
      onError: (error) => {
        console.error("Error removing game from library:", error);
        toast.error("Failed to remove game from library");
      },
    }
  );

  const onReviewUpdate = useMutation<ReviewUpdateData, Error, ReviewUpdateData>(
    async ({ gameId, rating, reviewText }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("game_reviews").upsert({
        user_id: user.id,
        game_id: gameId,
        rating,
        review_text: reviewText,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return { gameId, rating, reviewText };
    },
    {
      onSuccess: ({ gameId, rating, reviewText }) => {
        queryClient.setQueryData("userGames", (oldData: any) => {
          const updatedGames = oldData.userGames.map((game: UserGame) =>
            game.game_id === gameId
              ? {
                  ...game,
                  review: {
                    rating,
                    text: reviewText,
                  },
                }
              : game
          );
          return { ...oldData, userGames: updatedGames };
        });
        toast.success("Review updated successfully");
      },
      onError: (error) => {
        console.error("Error updating review:", error);
        toast.error("Failed to update review");
      },
    }
  );

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || game.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [games, searchQuery, statusFilter]);

  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return filteredGames.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [filteredGames, currentPage]);

  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Search and filter skeleton */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="w-[180px] h-10 bg-muted animate-pulse rounded-md" />
            <div className="w-[120px] h-10 bg-muted animate-pulse rounded-md" />
          </div>
        </div>

        {/* Games grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(GAMES_PER_PAGE)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="p-6">
          <CardContent className="text-center">
            <h3 className="text-lg font-semibold mb-2">Error loading games</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ReactErrorBoundary
      fallbackRender={ErrorFallback}
      onReset={() => {
        setSearchQuery("");
        setStatusFilter("all");
        setCurrentPage(1);
        queryClient.invalidateQueries("userGames");
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="playing">Playing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="want_to_play">Want to Play</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Game
            </Button>
          </div>
        </div>

        {paginatedGames.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No games found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "No games match your filters"
                  : "Start building your game collection by adding games"}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Game
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedGames.map((game, index) => (
                <GameCard
                  key={game.id}
                  id={game.id}
                  name={game.name}
                  cover={game.cover ?? undefined}
                  platforms={game.platforms}
                  status={game.status}
                  rating={game.review?.rating ?? undefined}
                  onStatusChange={(status) =>
                    updateGameStatus.mutate({ gameId: game.id, status })
                  }
                  onRemove={() => removeFromLibrary.mutate(game.id)}
                  isPriority={index < 4}
                  onReviewUpdate={(rating, reviewText) =>
                    onReviewUpdate.mutate({
                      gameId: game.id,
                      rating,
                      reviewText,
                    })
                  }
                />
              ))}
            </div>
            <div className="flex justify-center mt-6 space-x-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </ReactErrorBoundary>
  );
}
