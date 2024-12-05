"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchUserGames } from "@/utils/game-utils";
import Image from "next/image";

interface GamesTabProps {
  userId: string;
}

const GAMES_PER_PAGE = 10;

export function GamesTab({ userId }: GamesTabProps) {
  const supabase = useSupabaseClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["userGames", userId],
      queryFn: ({ pageParam = 0 }) =>
        fetchUserGames({
          supabase,
          start: pageParam * GAMES_PER_PAGE,
          end: (pageParam + 1) * GAMES_PER_PAGE - 1,
          userId,
        }),
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.hasMore) {
          return pages.length;
        }
        return undefined;
      },
    });

  if (status === "loading") {
    return <div className="text-center">Loading games...</div>;
  }

  if (status === "error") {
    return <div className="text-center text-red-500">Error loading games</div>;
  }

  const games = data?.pages.flatMap((page) => page.userGames) || [];
  const reviews = data?.pages.flatMap((page) => page.reviews) || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => {
          const gameReview = reviews.find(
            (review) => review.game_id === game.game_id
          );
          return (
            <Card key={game.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{game.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                {game.cover && (
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={game.cover.url}
                      alt={game.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                <p>Status: {game.status}</p>
                {game.platforms && game.platforms.length > 0 && (
                  <p>Platform: {game.platforms[0].name}</p>
                )}
                {gameReview && (
                  <p className="mt-2">Your Rating: {gameReview.rating}/10</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {hasNextPage && (
        <div className="text-center mt-4">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
