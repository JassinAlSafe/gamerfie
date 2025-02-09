"use client";

import React, { Suspense } from "react";
import { GameDetails } from "@/components/game/GameDetails";
import { useGame } from "@/hooks/useGame";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { GamePageProps } from "@/types/game";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-950">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-400 animate-pulse">
        Loading game details...
      </p>
    </div>
  );
}

function GameContent({ id }: { id: string }) {
  const { game, error } = useGame(id);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Game Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return <LoadingFallback />;
  }

  return <GameDetails game={game} />;
}

export function GamePageClient({ params }: GamePageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GameContent id={params.id} />
    </Suspense>
  );
}
