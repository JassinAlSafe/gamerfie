"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { Game } from "@/types";
import { getCoverImageUrl } from "@/utils/image-utils";
import { formatRating } from "@/utils/format-utils";
import { useRouter } from "next/navigation";

interface RelatedTabProps {
  game: Game;
}

export function RelatedTab({ game }: RelatedTabProps) {
  const router = useRouter();
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedGames() {
      try {
        setLoading(true);
        setError(null);

        // Create search params based on game's genres
        const genres = game.genres?.map(g => g.name).slice(0, 2) || [];
        
        const searchParams = new URLSearchParams({
          page: '1',
          limit: '8',
          sortBy: 'popularity'
        });

        if (genres.length > 0) {
          searchParams.append('genres', genres.join(','));
        }

        const response = await fetch(`/api/games?${searchParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch related games');
        }

        const data = await response.json();
        
        // Filter out the current game and limit to 8 results
        const filtered = data.games?.filter((g: Game) => g.id !== game.id).slice(0, 8) || [];
        setRelatedGames(filtered);
      } catch (err) {
        console.error('Error fetching related games:', err);
        setError('Failed to load related games');
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedGames();
  }, [game.id, game.genres]);

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
      {relatedGames.map((relatedGame) => (
        <motion.div
          key={relatedGame.id}
          whileHover={{ scale: 1.03 }}
          className="bg-gray-900/30 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:bg-gray-900/40"
          onClick={() => router.push(`/game/${relatedGame.id}`)}
        >
          {/* Game Cover */}
          <div className="relative aspect-[3/4] w-full">
            {relatedGame.cover || (relatedGame as any).cover_url ? (
              <Image
                src={getCoverImageUrl(
                  (relatedGame as any).cover_url || 
                  (typeof relatedGame.cover === "string" ? relatedGame.cover : relatedGame.cover?.url)
                )}
                alt={relatedGame.name}
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
              {relatedGame.name}
            </h3>

            <div className="flex items-center justify-between">
              {(relatedGame.rating || (relatedGame as any).total_rating) && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">
                    {formatRating(relatedGame.rating || (relatedGame as any).total_rating)}
                  </span>
                </div>
              )}

              {relatedGame.first_release_date && (
                <span className="text-sm text-gray-400">
                  {new Date(relatedGame.first_release_date * 1000).getFullYear()}
                </span>
              )}
            </div>

            {/* Genres */}
            {relatedGame.genres && relatedGame.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {relatedGame.genres.slice(0, 2).map((genre) => (
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
