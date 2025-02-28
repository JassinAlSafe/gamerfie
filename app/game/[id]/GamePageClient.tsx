"use client";

import React, { Suspense } from "react";
import { GameDetails } from "@/components/game/GameDetails";
import { useGame } from "@/hooks/Games/useGames"; // Updated import path
import { LoadingSpinner } from "@/components/loadingSpinner";
import { GamePageProps } from "@/types/game";
import { motion } from "framer-motion";
import { AlertTriangle, Gamepad2 } from "lucide-react";
import Link from "next/link";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-950">
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <Gamepad2 size={24} className="text-purple-500" />
        </div>
      </div>
      <p className="mt-6 text-gray-400 animate-pulse font-medium">
        Loading game details...
      </p>
    </div>
  );
}

function GameContent({ id }: { id: string }) {
  const { data: game, error, isError } = useGame(id);

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-950"
      >
        <div className="text-center max-w-md space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 mb-2">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Game Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error && typeof error === "object" && "message" in error
              ? (error as { message: string }).message
              : "Failed to load game"}
          </p>
          <Link
            href="/games"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Gamepad2 size={18} className="mr-2" />
            Browse Games
          </Link>
        </div>
      </motion.div>
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
