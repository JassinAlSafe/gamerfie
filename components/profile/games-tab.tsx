"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { fetchUserGames } from "@/utils/game-utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Gamepad2 } from "lucide-react";

interface GamesGridProps {
  userId: string;
}

const GAMES_PER_PAGE = 20;

export function GamesTab({ userId }: GamesGridProps) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, [supabase]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
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
    retry: (failureCount, error: any) => {
      if (error?.message === "No authenticated user") {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error: any) => {
      if (error?.message === "No authenticated user") {
        router.push("/signin");
      }
    },
  });

  if (!isAuthenticated) {
    router.push("/signin");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <Gamepad2 className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error loading games</h2>
        <p className="text-center max-w-md">
          {(error as Error).message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  const games = data?.pages.flatMap((page) => page.userGames) || [];

  return (
    <div className="">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {games.map((game) => (
          <div key={game.id} className="group relative">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105">
              {game.cover ? (
                <Image
                  src={game.cover.url.replace("t_thumb", "t_cover_big")}
                  alt={game.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Gamepad2 className="w-16 h-16 text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg truncate">
                    {game.name}
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">{game.status}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="text-center mt-12">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
          >
            {isFetchingNextPage ? "Loading more..." : "Load More Games"}
          </Button>
        </div>
      )}
    </div>
  );
}
