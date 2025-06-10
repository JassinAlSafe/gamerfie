"use client";

import { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Users, Flame } from "lucide-react";
import { Game } from "@/types";
import { getCoverImageUrl } from "@/utils/image-utils";

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
}

export const GameCard = memo(function GameCard({
  game,
  category = "popular",
  priority = false,
}: Omit<GameCardProps, "inView"> & { priority?: boolean }) {
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
    if (category === "upcoming") {
      const hypeCount =
        (game as any).follows_count || (game as any).hype_count || 0;
      return (
        <div className="flex items-center gap-2 text-sm text-gray-200">
          <Flame className="w-4 h-4 text-purple-400" aria-hidden="true" />
          <span>
            {hypeCount > 1000
              ? `${(hypeCount / 1000).toFixed(1)}k Anticipated`
              : hypeCount > 0
              ? `${hypeCount} Anticipated`
              : "Coming Soon"}
          </span>
        </div>
      );
    }

    // For trending and popular games
    const rating = (game as any).total_rating || game.rating;
    const ratingCount =
      (game as any).total_rating_count || (game as any).rating_count;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-200">
        {rating ? (
          <>
            <Star
              className="w-4 h-4 text-yellow-500 fill-yellow-500"
              aria-hidden="true"
            />
            <span>{Math.round(rating)}</span>
            {ratingCount && (
              <div className="flex items-center gap-1 ml-2">
                <Users className="w-4 h-4 text-blue-500" aria-hidden="true" />
                <span>
                  {ratingCount > 1000
                    ? `${(ratingCount / 1000).toFixed(1)}k`
                    : ratingCount}
                </span>
              </div>
            )}
          </>
        ) : null}
      </div>
    );
  };

  return (
    <Link
      href={`/game/${game.id}`}
      className="group isolate block w-full overflow-hidden rounded-xl bg-gradient-to-b from-gray-900/90 to-gray-950 shadow-lg ring-1 ring-gray-800/10 transition-all duration-300 hover:ring-purple-500/20 hover:ring-2 hover:shadow-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      aria-label={`View details for ${game.name}`}
    >
      <div className="relative flex flex-col h-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
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

        <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300">
          <h3 className="font-semibold text-white truncate mb-2 text-lg group-hover:text-purple-300 transition-colors duration-300">
            {game.name}
          </h3>
          <div className="flex items-center justify-between">
            {"first_release_date" in game && game.first_release_date && (
              <p className="text-sm text-gray-200 group-hover:text-white transition-colors duration-300">
                {new Date(game.first_release_date * 1000).getFullYear()}
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
