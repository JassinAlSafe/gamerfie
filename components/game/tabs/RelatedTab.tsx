"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { Game, Genre } from "@/types";
import { useRouter } from "next/navigation";
import { useRelatedGames } from "@/hooks/use-related-games";

interface RelatedTabProps {
  game: Game;
}

export function RelatedTab({ game }: RelatedTabProps) {
  const router = useRouter();
  const { relatedGames, loading, error } = useRelatedGames(game, {
    limit: 8,
    requireCover: true,
    requireRating: false
  });

  if (loading) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading related games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <p className="text-gray-400 text-center">{error}</p>
      </div>
    );
  }

  if (!relatedGames.length) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <p className="text-gray-400 text-center">No related games found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {relatedGames.map((safeGame) => (
        <motion.div
          key={safeGame.id}
          whileHover={{ scale: 1.03 }}
          className="bg-gray-900/30 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:bg-gray-900/40"
          onClick={() => router.push(`/game/${safeGame.id}`)}
        >
          {/* Game Cover */}
          <div className="relative aspect-[3/4] w-full">
            {safeGame.coverUrl ? (
              <Image
                src={safeGame.coverUrl}
                alt={safeGame.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <span className="text-gray-600 text-lg">No Cover</span>
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className="p-4">
            <h3 className="font-semibold text-white mb-2 line-clamp-1">
              {safeGame.name}
            </h3>

            <div className="flex items-center justify-between">
              {safeGame.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">
                    {safeGame.rating.toFixed(1)}
                  </span>
                </div>
              )}

              {safeGame.releaseYear && (
                <span className="text-sm text-gray-400">
                  {safeGame.releaseYear}
                </span>
              )}
            </div>

            {/* Genres */}
            {safeGame.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {safeGame.genres.slice(0, 2).map((genre: Genre, index: number) => (
                  <span
                    key={genre.id || index}
                    className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
