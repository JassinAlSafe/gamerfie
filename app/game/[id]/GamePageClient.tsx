"use client";

import React, { Suspense, useMemo } from "react";
import { GameDetails } from "@/components/game/GameDetails";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { GamePageProps } from "@/types";
import { motion } from "framer-motion";
import { AlertTriangle, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { createSafeJsonString, sanitizeString, sanitizeUrl, sanitizeStringArray } from "@/utils/sanitize";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950">
      {/* Skeleton header */}
      <div className="relative h-[80vh] bg-gray-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800/20 via-gray-900/60 to-gray-950/90" />
        
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
          <div className="pt-8">
            <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
          </div>
          
          <div className="flex-grow flex items-end pb-20">
            <div className="flex flex-col md:flex-row gap-16 items-center md:items-start w-full">
              {/* Cover skeleton */}
              <div className="w-72 aspect-[3/4] bg-gray-800 rounded-xl animate-pulse" />
              
              {/* Content skeleton */}
              <div className="flex-1 space-y-6">
                <div className="h-16 bg-gray-800 rounded animate-pulse" />
                <div className="flex gap-3">
                  <div className="h-8 w-20 bg-gray-800 rounded-full animate-pulse" />
                  <div className="h-8 w-16 bg-gray-800 rounded-full animate-pulse" />
                  <div className="h-8 w-24 bg-gray-800 rounded-full animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-1/2" />
                </div>
                <div className="flex gap-3">
                  <div className="h-10 w-32 bg-gray-800 rounded animate-pulse" />
                  <div className="h-10 w-28 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Centered loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="xl" label="Loading game details..." />
        </div>
      </div>
    </div>
  );
}

function GameContent({ gameData }: { gameData: any }) {
  // Use pre-fetched server-side data instead of client-side hook
  const game = gameData;
  const isError = !!(gameData?.error && gameData?.dataSource === 'error-fallback');

  // Must call all hooks before any conditional returns (Rules of Hooks)
  const structuredData = useMemo(() => {
    if (!game) return null;

    const gameData = game;
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": sanitizeString(gameData.name),
      "description": sanitizeString(gameData.summary || `Track your progress and connect with other players of ${sanitizeString(gameData.name)} on Game Vault.`),
      "url": sanitizeUrl(`https://gamersvaultapp.com/game/${gameData.id}`),
      "image": sanitizeUrl(gameData.cover_url),
      "datePublished": gameData.first_release_date ? new Date(gameData.first_release_date * 1000).toISOString() : undefined,
      "developer": gameData.involved_companies?.find(c => c.developer) ? {
        "@type": "Organization", 
        "name": sanitizeString(gameData.involved_companies.find(c => c.developer)?.company?.name || '')
      } : undefined,
      "publisher": gameData.involved_companies?.find(c => c.publisher) ? {
        "@type": "Organization",
        "name": sanitizeString(gameData.involved_companies.find(c => c.publisher)?.company?.name || '')  
      } : undefined,
      "genre": sanitizeStringArray(gameData.genres?.map(g => typeof g === 'string' ? g : g.name) || []),
      "gamePlatform": sanitizeStringArray(gameData.platforms?.map(p => typeof p === 'string' ? p : p.name) || []),
      "applicationCategory": "Game",
      "operatingSystem": gameData.platforms ? sanitizeStringArray(gameData.platforms.map(p => typeof p === 'string' ? p : p.name)).join(", ") || "Multi-platform" : "Multi-platform",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "category": "Video Game"
      },
      "aggregateRating": (gameData.rating || gameData.total_rating) ? {
        "@type": "AggregateRating",
        "ratingValue": Math.min(Math.max((gameData.rating || gameData.total_rating || 0) / 20, 1), 5).toFixed(1),
        "ratingCount": gameData.rating_count || gameData.total_rating_count || 1,
        "bestRating": 5,
        "worstRating": 1
      } : undefined
    };

    return structuredData;
  }, [game]);

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
            {gameData?.error || "Failed to load game"}
          </p>
          <Link
            href="/all-games"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
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

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: createSafeJsonString(structuredData),
          }}
        />
      )}
      <GameDetails game={game} />
    </>
  );
}

export function GamePageClient({ gameData, params }: GamePageProps & { gameData: any }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GameContent gameData={gameData} />
    </Suspense>
  );
}
