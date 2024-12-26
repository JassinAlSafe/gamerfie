"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Game } from "@/types/game";
import { getCoverImageUrl } from "@/utils/image-utils";
import { formatRating } from "@/utils/format-utils";
import { useRouter } from "next/navigation";

interface RelatedTabProps {
  games: Game[];
}

export function RelatedTab({ games }: RelatedTabProps) {
  const router = useRouter();

  if (!games.length) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <p className="text-gray-400 text-center">No related games found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {games.map((game) => (
        <motion.div
          key={game.id}
          whileHover={{ scale: 1.03 }}
          className="bg-gray-900/30 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:bg-gray-900/40"
          onClick={() => router.push(`/game/${game.id}`)}
        >
          {/* Game Cover */}
          <div className="relative aspect-[3/4] w-full">
            {game.cover ? (
              <Image
                src={getCoverImageUrl(game.cover.url)}
                alt={game.name}
                fill
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
              {game.name}
            </h3>

            <div className="flex items-center justify-between">
              {game.total_rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">
                    {formatRating(game.total_rating)}
                  </span>
                </div>
              )}

              {game.first_release_date && (
                <span className="text-sm text-gray-400">
                  {new Date(game.first_release_date * 1000).getFullYear()}
                </span>
              )}
            </div>

            {/* Genres */}
            {game.genres && game.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {game.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.id}
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
