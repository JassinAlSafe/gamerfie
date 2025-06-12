"use client";

import { Calendar, Star, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Game } from "@/types";
import { useState, memo } from "react";
import { getValidYear } from "@/utils/format-utils";

// Add interface for RAWG API game properties that aren't in our Game type
interface RAWGGameProperties {
  released?: string;
  parent_platforms?: Array<{
    platform: {
      id: number;
      name: string;
    };
  }>;
}

interface ListViewGameCardProps {
  game: Game & Partial<RAWGGameProperties>;
  priority?: boolean;
}

export const ListViewGameCard = memo(function ListViewGameCard({
  game,
  priority = false,
}: ListViewGameCardProps) {
  const [isLoading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Handle image URL
  const imageUrl = (() => {
    if (imageError) return "/placeholder.png";
    return (
      (game as any).background_image ||
      (game as any).cover?.url ||
      (game as any).cover_url ||
      "/placeholder.png"
    );
  })();

  return (
    <Link
      href={`/game/${game.id}`}
      className="flex items-center gap-4 bg-gray-800/40 hover:bg-gray-800/60 p-3 rounded-lg border border-gray-700/30 transition-colors group focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      aria-label={`View details for ${game.name}`}
    >
      <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
        {/* Game thumbnail */}
        <Image
          src={imageUrl}
          alt={game.name}
          fill
          priority={priority}
          sizes="64px"
          className={`
            object-cover transition-all duration-300
            ${isLoading ? "scale-110 blur-sm" : "scale-100 blur-0"}
            group-hover:scale-105
          `}
          onLoad={() => setLoading(false)}
          onError={() => setImageError(true)}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate group-hover:text-purple-300 transition-colors">
          {game.name}
        </h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
          {/* Release date - RAWG format */}
          {"released" in game && game.released && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span>{new Date(game.released).getFullYear()}</span>
            </div>
          )}

          {/* First release date - IGDB format */}
          {getValidYear(game.first_release_date) && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span>{getValidYear(game.first_release_date)}</span>
            </div>
          )}

          {/* Show TBA if no valid date */}
          {!("released" in game && game.released) &&
            !getValidYear(game.first_release_date) && (
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                <span>TBA</span>
              </div>
            )}

          {/* Rating */}
          {game.rating && game.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" aria-hidden="true" />
              <span>{game.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Platforms - RAWG format */}
          {"parent_platforms" in game &&
            game.parent_platforms &&
            game.parent_platforms.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden="true" />
                <span className="truncate max-w-[150px]">
                  {game.parent_platforms.map((p) => p.platform.name).join(", ")}
                </span>
              </div>
            )}

          {/* Platforms - Our standard format */}
          {game.platforms && game.platforms.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden="true" />
              <span className="truncate max-w-[150px]">
                {game.platforms.map((p) => p.name).join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});
