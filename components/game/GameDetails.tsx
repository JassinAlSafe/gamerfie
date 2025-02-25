"use client";

import React from "react";
import { Game } from "@/types/game";
import { useProfile } from "@/hooks/Profile/use-profile";
import { useProgressStore } from "@/stores/useProgressStore";
import { useGameActivities } from "@/hooks/Games/use-game-activities";
import { useErrorStore } from "@/stores/useErrorStore";
import { GameHero } from "./hero/GameHero";
import { GameTabs } from "./tabs/GameTabs";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { ErrorBoundary } from "react-error-boundary";
import { motion } from "framer-motion";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] p-8"
    >
      <div className="max-w-md w-full space-y-4 text-center">
        <h2 className="text-2xl font-bold text-red-500">
          Something went wrong
        </h2>
        <p className="text-gray-400">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </motion.div>
  );
}

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

export function GameDetails({ game }: { game: Game }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      <GameContent game={game} />
    </ErrorBoundary>
  );
}

function GameContent({ game }: { game: Game }) {
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = React.useState("overview");
  const {
    play_time: playTime,
    completion_percentage: completionPercentage,
    achievements_completed: achievementsCompleted,
    playTimeHistory,
    achievementHistory,
    loading: progressLoading,
    fetchProgress,
    error: progressError,
  } = useProgressStore();

  const {
    activities,
    loading: activitiesLoading,
    hasMore,
    loadMore,
    error: activitiesError,
  } = useGameActivities(game.id.toString());

  const { addError } = useErrorStore();

  React.useEffect(() => {
    if (profile?.id && game?.id) {
      fetchProgress(profile.id.toString(), game.id.toString());
    }
  }, [profile?.id, game?.id, fetchProgress]);

  React.useEffect(() => {
    if (progressError) {
      addError("api", "Failed to load progress");
    }
    if (activitiesError) {
      addError("api", "Failed to load activities");
    }
  }, [progressError, activitiesError, addError]);

  const processedGame = {
    ...game,
    achievements: {
      total: 0,
      completed: 0,
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <GameHero
        game={processedGame}
        profile={profile}
        progress={{
          playTime: playTime ?? undefined,
          completionPercentage: completionPercentage ?? undefined,
          achievementsCompleted: achievementsCompleted ?? undefined,
        }}
      />

      <GameTabs
        game={processedGame}
        profile={profile ?? null}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        progress={{
          playTime: playTime ?? null,
          completionPercentage: completionPercentage ?? null,
          achievementsCompleted: achievementsCompleted ?? null,
          loading: progressLoading,
          playTimeHistory,
          achievementHistory,
        }}
        activities={{
          data: activities,
          loading: activitiesLoading,
          hasMore,
          loadMore,
        }}
      />
    </div>
  );
}
