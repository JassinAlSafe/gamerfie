"use client";

import React, { Suspense } from "react";
import { GameDetails } from "@/components/game/GameDetails";
import { useGameDetails } from "@/hooks/Games/use-game-details";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { GamePageProps } from "@/types";
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
  const { game, error } = useGameDetails(id);
  const isError = !!error;

  // Generate structured data for the game
  const generateGameStructuredData = (gameData: any) => {
    if (!gameData) return null;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": gameData.name,
      "description": gameData.description || `Track your progress and connect with other players of ${gameData.name} on Game Vault.`,
      "url": `https://gamersvaultapp.com/game/${gameData.id}`,
      "image": gameData.cover_url,
      "datePublished": gameData.release_date,
      "developer": gameData.developer ? {
        "@type": "Organization", 
        "name": gameData.developer
      } : undefined,
      "publisher": gameData.publisher ? {
        "@type": "Organization",
        "name": gameData.publisher  
      } : undefined,
      "genre": Array.isArray(gameData.genres) ? gameData.genres : [gameData.genres].filter(Boolean),
      "gamePlatform": gameData.platforms || [],
      "applicationCategory": "Game",
      "operatingSystem": gameData.platforms || "Multi-platform",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "category": "Video Game"
      },
      "aggregateRating": gameData.rating ? {
        "@type": "AggregateRating",
        "ratingValue": gameData.rating,
        "ratingCount": gameData.rating_count || 1,
        "bestRating": 10,
        "worstRating": 1
      } : undefined
    };

    return structuredData;
  };

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

  const structuredData = generateGameStructuredData(game);

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      <GameDetails game={game} />
    </>
  );
}

export function GamePageClient({ params }: GamePageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GameContent id={params.id} />
    </Suspense>
  );
}
