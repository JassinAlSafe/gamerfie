"use client";

import { useState, useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useUserGames, useGamesList } from "@/hooks/useGames";
import { GamesList } from "./games/GamesList";
import { GamesFilter } from "./games/GamesFilter";
import { GamesPagination } from "./games/GamesPagination";
import { LoadingSkeleton } from "./games/LoadingSkeleton";
import { ErrorCard } from "./games/ErrorCard";
import { NoGamesFound } from "./games/NoGamesFound";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase-client";
import { Game, GameStatus, ReviewUpdateData } from "@/types/game";

interface GameTabProps {
  userId: string;
  onGamesUpdate?: (games: Game[]) => void;
  onHeartGame?: (gameId: string) => void;
}

export function GamesTab({ userId, onGamesUpdate, onHeartGame }: GameTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GameStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const { data, isLoading, error, fetchNextPage, hasNextPage } =
    useUserGames(userId);

  const { filteredGames, totalPages, totalGames } = useGamesList(
    data?.pages,
    searchQuery,
    statusFilter,
    currentPage
  );

  const updateGameStatus = useMutation({
    mutationFn: async ({
      gameId,
      status,
    }: {
      gameId: string;
      status: GameStatus;
    }) => {
      const { error } = await supabase
        .from("user_games")
        .update({ status })
        .eq("game_id", gameId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userGames", userId]);
    },
  });

  const removeFromLibrary = useMutation({
    mutationFn: async (gameId: string) => {
      const { error } = await supabase
        .from("user_games")
        .delete()
        .eq("game_id", gameId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userGames", userId]);
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({ gameId, rating, reviewText }: ReviewUpdateData) => {
      const { error } = await supabase.from("reviews").upsert({
        game_id: gameId,
        user_id: userId,
        rating,
        review_text: reviewText,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userGames", userId]);
    },
  });

  const toggleHeart = useMutation({
    mutationFn: async ({
      gameId,
      isHearted,
    }: {
      gameId: string;
      isHearted: boolean;
    }) => {
      const { error } = await supabase
        .from("game_hearts")
        [isHearted ? "delete" : "insert"]({
          game_id: gameId,
          user_id: userId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userGames", userId]);
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleHeartClick = useCallback(
    async (gameId: number, isHearted: boolean) => {
      try {
        await toggleHeart.mutateAsync({ gameId: gameId.toString(), isHearted });
        onHeartGame?.(gameId.toString());
      } catch (error) {
        console.error("Error handling heart click:", error);
      }
    },
    [toggleHeart, onHeartGame]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorCard error={error} />;

  return (
    <ErrorBoundary FallbackComponent={ErrorCard}>
      <div className="space-y-6">
        <GamesFilter
          searchQuery={searchQuery}
          setSearchQuery={handleSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        {filteredGames.length === 0 ? (
          <NoGamesFound searchQuery={searchQuery} statusFilter={statusFilter} />
        ) : (
          <>
            <GamesList
              games={filteredGames}
              mutations={{
                updateGameStatus,
                removeFromLibrary,
                updateReview,
                toggleHeart,
              }}
              userId={userId}
              onHeartClick={handleHeartClick}
              isHeartingGame={toggleHeart.isLoading}
            />
            {totalPages > 1 && (
              <GamesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
            {hasNextPage && (
              <button
                onClick={handleLoadMore}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
