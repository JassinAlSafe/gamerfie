"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "../ErrorBoundary";
import LoadingSpinner from "../loadingSpinner";
import GameCarousel from "../GameCarousel";
import { Game } from "@/types/game";
import { Gamepad2, Library } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Platform {
  id: number;
  name: string;
}

interface PlatformGames {
  platform: Platform;
  games: Game[];
}

const fetchGames = async (): Promise<{ platformGames: PlatformGames[] }> => {
  const response = await fetch("/api/games", { method: "POST" });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const PlatformGameCarousels: React.FC = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: fetchGames,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (previously cacheTime)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.error("Error in PlatformGameCarousels:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <Gamepad2 className="w-16 h-16 mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-2">Error loading game data</h2>
        <p className="text-gray-400 text-center max-w-md">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <p className="mt-4 text-blue-400 hover:text-blue-300 cursor-pointer">
          Please try refreshing the page or contact support if the problem
          persists.
        </p>
      </div>
    );
  }

  if (!data || !data.platformGames || data.platformGames.length === 0) {
    console.warn("No game data available");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <Gamepad2 className="w-16 h-16 mb-4 text-gray-600" />
        <h2 className="text-2xl font-bold mb-2">No game data available</h2>
        <p className="text-gray-400">
          Check back later for exciting new games!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-8 px-4 md:px-8" style={{ backgroundColor: 'rgb(3, 6, 22)' }}>
      <ErrorBoundary
        fallback={
          <div className="text-white p-4 bg-red-500/10 rounded-lg">
            Error loading games. Please try again later.
          </div>
        }
      >
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Game Library
        </h1>
        <div className="flex justify-end mb-8">
          <Link href="/all-games">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Library className="mr-2 h-5 w-5" />
              View All Games
            </Button>
          </Link>
        </div>
        <div className="space-y-12">
          {data.platformGames.map(({ platform, games }) => (
            <div key={platform.id} className="w-full">
              <GameCarousel title={`${platform.name} Games`} games={games} />
            </div>
          ))}
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default PlatformGameCarousels;