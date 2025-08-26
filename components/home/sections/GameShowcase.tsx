"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Calendar,
  Gamepad2,
  Star,
  Wifi,
  WifiOff,
  Database,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { getCoverImageUrl } from "@/utils/image-utils";
import { getValidYear, getValidPlayingCount } from "@/utils/format-utils";
import { useTrendingGames } from "@/hooks/Games/use-trending-games";
import { Badge } from "@/components/ui/badge";

function GameShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full rounded-lg bg-gray-800/50" />
          <div className="space-y-2 px-1">
            <Skeleton className="h-4 w-full bg-gray-800/50" />
            <Skeleton className="h-3 w-3/4 bg-gray-800/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GameCard({ game, index }: { game: any; index: number }) {
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatRating = (rating: number) => {
    return (rating / 20).toFixed(1); // Convert from 0-100 to 0-5 scale
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group cursor-pointer relative"
      role="listitem"
    >
      <Link 
        href={`/game/${game.id}`}
        aria-label={`View details for ${game.name}`}
      >
        <div className="relative overflow-hidden rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] min-h-[280px] flex flex-col">
          {/* Game Cover */}
          <div className="aspect-[3/4] relative overflow-hidden flex-shrink-0">
            {game.cover?.url || game.cover_url ? (
              <Image
                src={getCoverImageUrl(game.cover?.url || game.cover_url)}
                alt={`${game.name} game cover`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                priority={index < 6} // Prioritize all above-the-fold images
                loading={index < 6 ? "eager" : "lazy"}
              />
            ) : (
              <div 
                className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
                role="img"
                aria-label={`${game.name} - No cover image available`}
              >
                <Gamepad2 className="w-12 h-12 text-gray-500" />
              </div>
            )}

            {/* Overlay with stats */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-3 left-3 right-3 space-y-2">
                {game.stats && (
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{formatCount(game.stats.user_count || 0)}</span>
                    </div>
                    {game.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{formatRating(game.rating)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Info */}
          <div className="p-3 space-y-2 flex-grow flex flex-col justify-between">
            <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">
              {game.name}
            </h3>

            <div className="flex items-center justify-between text-xs text-gray-400">
              {/* Playing count - Remove redundant trending indicator */}
              {getValidPlayingCount(game.stats?.currently_playing) ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>
                    {formatCount(
                      getValidPlayingCount(game.stats?.currently_playing)!
                    )}{" "}
                    playing
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-400">Popular</span>
                </div>
              )}

              {/* Release year */}
              {getValidYear(game.first_release_date) ? (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{getValidYear(game.first_release_date)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>TBA</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function GameShowcase() {
  const {
    games: trendingGames,
    isLoading,
    error,
    connectivity,
    sources,
    lastUpdated,
    retry,
  } = useTrendingGames({
    limit: 12,
    source: "auto",
    enablePolling: false, // Disable polling to reduce API calls
    pollInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return (
    <section 
      className="py-12 sm:py-16 lg:py-24 relative"
      aria-label="Trending games showcase"
      role="region"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Trending on Gamerfie
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
            Discover the hottest games our community is playing right now.
          </p>
        </motion.div>

        {/* Trending Games Section */}
        <div className="mb-12 sm:mb-16 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Trending Games
              </h3>
            </div>

            {/* API Status Indicator */}
            <div className="flex items-center gap-2">
              {sources && sources.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>Sources:</span>
                  {sources.map((source) => (
                    <Badge
                      key={source}
                      variant="outline"
                      className="text-xs px-2 py-0.5 border-gray-600 text-gray-300"
                    >
                      {source === "igdb" ? "IGDB" : "RAWG"}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1">
                {connectivity?.igdb ? (
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">IGDB</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">IGDB</span>
                  </div>
                )}

                {connectivity?.rawg ? (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">RAWG</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">RAWG</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <GameShowcaseSkeleton />
          ) : error || !trendingGames || trendingGames.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="space-y-2">
                {connectivity?.igdb === false &&
                connectivity?.rawg === false ? (
                  <>
                    <WifiOff className="w-12 h-12 text-red-400 mx-auto" />
                    <p className="text-gray-400 mb-4">
                      Game databases are temporarily unavailable
                    </p>
                    <p className="text-sm text-gray-500">
                      We're working to restore the service. Please try again in
                      a few minutes.
                    </p>
                  </>
                ) : connectivity?.igdb === false ||
                  connectivity?.rawg === false ? (
                  <>
                    <Wifi className="w-12 h-12 text-yellow-400 mx-auto" />
                    <p className="text-gray-400 mb-4">
                      Some game services are temporarily unavailable
                    </p>
                    <div className="text-sm text-gray-500">
                      Available sources: {connectivity?.igdb && "IGDB"}{" "}
                      {connectivity?.rawg && "RAWG"}
                    </div>
                  </>
                ) : (
                  <>
                    <Gamepad2 className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-400 mb-4">
                      No trending games available right now
                    </p>
                    <p className="text-sm text-gray-500">
                      Check back later or explore our game catalog
                    </p>
                  </>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={retry}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Try Again"}
                </Button>
                <Link href="/explore">
                  <Button
                    variant="default"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Browse All Games
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div 
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 relative"
                role="list"
                aria-label="Trending games grid"
              >
                {trendingGames.slice(0, 12).map((game, index) => (
                  <GameCard key={game.id} game={game} index={index} />
                ))}
              </div>

              {/* Last Updated Info */}
              {lastUpdated && (
                <div className="text-center mt-6">
                  <p className="text-xs text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/explore">
            <Button
              variant="outline"
              size="lg"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base"
            >
              Explore All Games
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
