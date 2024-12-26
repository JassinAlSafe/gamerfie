"use client";

import React, { useState, Suspense } from "react";
import { Game } from "@/types/game";
import { useProfile } from "@/hooks/use-profile";
import { useProgressStore } from "@/stores/useProgressStore";
import { useGameActivities } from "@/hooks/use-game-activities";
import { useErrorStore } from "@/stores/useErrorStore";
import { GameHero } from "./hero/GameHero";
import { GameTabs } from "./tabs/GameTabs";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { ErrorBoundary } from "react-error-boundary";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-950"
    >
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-400 animate-pulse">
        Loading game details...
      </p>
    </motion.div>
  );
}

function GameContent({ game }: { game: Game }) {
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { profile } = useProfile();
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

  // Subscribe to real-time updates
  React.useEffect(() => {
    const supabase = createClientComponentClient();

    // Subscribe to progress updates
    const progressSubscription = supabase
      .channel("game_progress")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_games",
          filter: `game_id=eq.${game.id}`,
        },
        (payload) => {
          // Refresh progress data
          if (profile?.id) {
            fetchProgress(profile.id.toString(), game.id.toString());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(progressSubscription);
    };
  }, [game.id, profile?.id, fetchProgress]);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (mounted && profile?.id && game?.id) {
      fetchProgress(profile.id.toString(), game.id.toString());
    }
  }, [mounted, profile?.id, game?.id, fetchProgress]);

  React.useEffect(() => {
    if (progressError) {
      addError("api", "Failed to load progress");
    }
    if (activitiesError) {
      addError("api", "Failed to load activities");
    }
  }, [progressError, activitiesError, addError]);

  if (!mounted) {
    return <LoadingFallback />;
  }

  if (!game) {
    return <LoadingFallback />;
  }

  const processedGame = {
    ...game,
    achievements: game.achievements || [],
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="game-details"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-950 text-white"
      >
        <GameHero
          game={processedGame}
          profile={profile}
          progress={{
            playTime,
            completionPercentage,
            achievementsCompleted,
          }}
        />

        <GameTabs
          game={processedGame}
          profile={profile}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          progress={{
            playTime,
            completionPercentage,
            achievementsCompleted,
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
      </motion.div>
    </AnimatePresence>
  );
}

export function GameDetails({ game }: { game: Game }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state here
        window.location.reload();
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <GameContent game={game} />
      </Suspense>
    </ErrorBoundary>
  );
}
