"use client";

import React from "react";
import { GameDetails } from "@/components/game/GameDetails";
import { useGame } from "@/hooks/useGame";
import { LoadingSpinner } from "@/components/loadingSpinner";

interface GamePageProps {
  params: {
    id: string;
  };
}

export default function GamePage({ params }: GamePageProps) {
  const { game, isLoading, error } = useGame(params.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Game Not Found</h1>
          <p className="text-gray-400">
            {error || "The game you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return <GameDetails game={game} />;
}
