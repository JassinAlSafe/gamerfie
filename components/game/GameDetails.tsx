"use client";

import React, { useEffect, useState } from "react";
import { Game } from "@/types/game";
import { useProfile } from "@/hooks/Profile/use-profile";
import { useProgressStore } from "@/stores/useProgressStore";
import { useGameActivities } from "@/hooks/Games/use-game-activities";
import { useErrorStore } from "@/stores/useErrorStore";
import { GameHero } from "./hero/GameHero";
import { GameTabs } from "./tabs/GameTabs";
import { ErrorBoundary } from "react-error-boundary";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="flex flex-col items-center justify-center min-h-[60vh] p-8"
    >
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-500 mb-2">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-gray-400 text-sm md:text-base">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw size={18} className="animate-spin-slow" />
          Try again
        </button>
      </div>
    </motion.div>
  );
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-950 text-white relative"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] pointer-events-none" />

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

      {/* Scroll to top button */}
      <ScrollToTopButton />
    </motion.div>
  );
}
