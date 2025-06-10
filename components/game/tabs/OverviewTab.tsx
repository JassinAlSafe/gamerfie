"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Trophy,
  Calendar,
  Tag,
  Monitor,
  Gamepad,
  ChevronRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Game } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/image-utils";
import { useRouter } from "next/navigation";

interface OverviewTabProps {
  game: Game;
  onViewMoreRelated?: () => void;
}

export function OverviewTab({ game, onViewMoreRelated }: OverviewTabProps) {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isStorylineExpanded, setIsStorylineExpanded] = useState(false);
  const router = useRouter();

  const summaryMaxLength = 300;
  const storylineMaxLength = 300;

  const truncatedSummary = React.useMemo(() => {
    const summary = (game as any).summary;
    if (!summary || summary.length <= summaryMaxLength) return summary;
    return isAboutExpanded
      ? summary
      : `${summary.slice(0, summaryMaxLength)}...`;
  }, [(game as any).summary, isAboutExpanded]);

  const truncatedStoryline = React.useMemo(() => {
    const storyline = (game as any).storyline;
    if (!storyline || storyline.length <= storylineMaxLength) return storyline;
    return isStorylineExpanded
      ? storyline
      : `${storyline.slice(0, storylineMaxLength)}...`;
  }, [(game as any).storyline, isStorylineExpanded]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Get related games (if available)
  const relatedGames = (game as any).relatedGames || [];
  const hasRelatedGames = relatedGames.length > 0;

  return (
    <motion.div
      className="space-y-8 py-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* About */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-md transition-all duration-300 hover:bg-gray-900/50 border border-gray-800/30 shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
          <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
          About
        </h3>
        <div className="space-y-6">
          <div>
            <p className="text-gray-300 leading-relaxed">
              {truncatedSummary || "No description available for this game."}
            </p>
            {(game as any).summary &&
              (game as any).summary.length > summaryMaxLength && (
                <Button
                  variant="link"
                  onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                  className="mt-2 text-purple-400 hover:text-purple-300 p-0 h-auto font-semibold"
                >
                  {isAboutExpanded ? "Show Less" : "Read More"}
                </Button>
              )}
          </div>
          {(game as any).storyline && (
            <div>
              <h4 className="text-lg font-semibold mb-2 text-white/90">
                Storyline
              </h4>
              <p className="text-gray-300 leading-relaxed">
                {truncatedStoryline}
              </p>
              {(game as any).storyline.length > storylineMaxLength && (
                <Button
                  variant="link"
                  onClick={() => setIsStorylineExpanded(!isStorylineExpanded)}
                  className="mt-2 text-purple-400 hover:text-purple-300 p-0 h-auto font-semibold"
                >
                  {isStorylineExpanded ? "Show Less" : "Read More"}
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Game Info */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-md transition-all duration-300 hover:bg-gray-900/50 border border-gray-800/30 shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Game Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Release Date */}
          {game.first_release_date && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                Release Date
              </h4>
              <p className="text-white font-medium">
                {new Date(game.first_release_date * 1000).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          )}

          {/* Genres */}
          {game.genres && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-green-400" />
                Genres
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(game.genres) && game.genres.length > 0 ? (
                  game.genres.map((genre) => (
                    <Badge
                      key={genre.id || genre.name}
                      variant="secondary"
                      className="bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors duration-200"
                    >
                      {genre.name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="bg-white/5">
                    No genres available
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Platforms */}
          {game.platforms && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Gamepad className="w-4 h-4 mr-2 text-purple-400" />
                Platforms
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(game.platforms) && game.platforms.length > 0 ? (
                  game.platforms.map((platform) => (
                    <Badge
                      key={platform.id}
                      variant="secondary"
                      className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors duration-200"
                    >
                      {platform.name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="bg-white/5">
                    No platforms available
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Developer/Publisher */}
          {(game as any).involved_companies && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Monitor className="w-4 h-4 mr-2 text-blue-400" />
                Companies
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray((game as any).involved_companies) &&
                (game as any).involved_companies.length > 0 ? (
                  (game as any).involved_companies.map((company) => (
                    <Badge
                      key={company.id}
                      variant="secondary"
                      className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors duration-200"
                    >
                      {company.company?.name || "Unknown"}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="bg-white/5">
                    No companies available
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Similar Games Preview */}
      {hasRelatedGames && (
        <motion.div
          variants={itemVariants}
          className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-md transition-all duration-300 hover:bg-gray-900/50 border border-gray-800/30 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center text-white">
              <Gamepad className="w-5 h-5 mr-2 text-indigo-400" />
              Similar Games
            </h3>
            {relatedGames.length > 4 && (
              <Button
                variant="ghost"
                onClick={onViewMoreRelated}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedGames.slice(0, 4).map((relatedGame) => (
              <motion.div
                key={relatedGame.id}
                whileHover={{ scale: 1.03 }}
                className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:bg-gray-800/70 border border-gray-700/30"
                onClick={() => router.push(`/game/${relatedGame.id}`)}
              >
                {/* Game Cover */}
                <div className="relative aspect-[3/4] w-full">
                  {relatedGame.cover?.url || (relatedGame as any).cover_url ? (
                    <Image
                      src={getCoverImageUrl(
                        relatedGame.cover?.url ||
                          (relatedGame as any).cover_url ||
                          ""
                      )}
                      alt={relatedGame.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">No Cover</span>
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="p-3">
                  <h4 className="font-medium text-white text-sm mb-1 line-clamp-1">
                    {relatedGame.name}
                  </h4>

                  <div className="flex items-center justify-between">
                    {(relatedGame as any).rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-400">
                          {(relatedGame as any).rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {relatedGame.first_release_date && (
                      <span className="text-xs text-gray-400">
                        {new Date(
                          relatedGame.first_release_date * 1000
                        ).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
