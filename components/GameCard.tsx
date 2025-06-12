"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Users, Clock } from "lucide-react";
import { Game } from "@/types";
import { getCoverImageUrl } from "@/utils/image-utils";
import { getValidYear } from "@/utils/format-utils";

// Define CategoryOption locally to avoid import issues
type CategoryOption =
  | "all"
  | "popular"
  | "trending"
  | "upcoming"
  | "recent"
  | "classic";

interface GameCardProps {
  game: Game;
  index?: number;
  category?: CategoryOption;
  priority?: boolean;
}

export const GameCard = memo(function GameCard({
  game,
  index: _index,
  category: _category,
  priority = false,
}: GameCardProps) {
  const [isLoading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Handle both IGDB and processed cover URL formats
  const coverUrl = (() => {
    if (imageError) return "/placeholder.png"; // Fallback image
    if (
      !game.cover_url &&
      (!game.cover || typeof game.cover !== "object" || !game.cover.url)
    )
      return "/placeholder.png";

    const rawUrl =
      game.cover_url ||
      (game.cover && typeof game.cover === "object"
        ? game.cover.url
        : undefined);
    // If URL is already https, use it directly
    if (rawUrl?.startsWith("https://")) return rawUrl;
    // Otherwise, process it
    return getCoverImageUrl(rawUrl || "");
  })();

  const renderMetrics = () => {
    const metrics = [];

    if (game.rating && game.rating > 0) {
      metrics.push(
        <div key="rating" className="flex items-center gap-1 text-yellow-400">
          <Star className="w-3 h-3 fill-yellow-400" />
          <span className="text-xs font-medium">{game.rating.toFixed(1)}</span>
        </div>
      );
    }

    if ((game as any).total_rating_count) {
      metrics.push(
        <div key="votes" className="flex items-center gap-1 text-gray-400">
          <Users className="w-3 h-3" />
          <span className="text-xs">
            {(game as any).total_rating_count > 1000
              ? `${((game as any).total_rating_count / 1000).toFixed(1)}k`
              : (game as any).total_rating_count}
          </span>
        </div>
      );
    }

    if ((game as any).playTime) {
      metrics.push(
        <div key="playtime" className="flex items-center gap-1 text-blue-400">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{(game as any).playTime}h</span>
        </div>
      );
    }

    return <div className="flex items-center gap-2">{metrics.slice(0, 2)}</div>;
  };

  return (
    <Link
      href={`/game/${game.id}`}
      className="group isolate block w-full overflow-hidden rounded-xl bg-gradient-to-b from-gray-900/90 to-gray-950 shadow-lg ring-1 ring-gray-800/10 transition-all duration-300 hover:ring-purple-500/20 hover:ring-2 hover:shadow-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[320px] flex flex-col"
      aria-label={`View details for ${game.name}`}
    >
      <div className="relative flex flex-col h-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden flex-shrink-0">
          <Image
            src={coverUrl}
            alt={`Cover image for ${game.name}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`
              object-cover w-full h-full transition-all duration-500
              ${isLoading ? "scale-110 blur-2xl" : "scale-100 blur-0"}
              group-hover:scale-105
            `}
            quality={90}
            onLoad={() => setLoading(false)}
            onError={() => setImageError(true)}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 flex-grow flex flex-col justify-end">
          <h3 className="font-semibold text-white truncate mb-2 text-lg group-hover:text-purple-300 transition-colors duration-300">
            {game.name}
          </h3>
          <div className="flex items-center justify-between">
            {getValidYear(game.first_release_date) ? (
              <p className="text-sm text-gray-200 group-hover:text-white transition-colors duration-300">
                {getValidYear(game.first_release_date)}
              </p>
            ) : (
              <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                TBA
              </p>
            )}
            <div className="group-hover:text-white transition-colors duration-300">
              {renderMetrics()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
