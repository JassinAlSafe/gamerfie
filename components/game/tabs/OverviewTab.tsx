"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Trophy,
  Calendar,
  Star,
  Gamepad2,
  Globe,
  Users,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatDateSafe, getValidYear } from "@/utils/format-utils";
import { ensureAbsoluteUrl } from "@/lib/utils";

interface OverviewTabProps {
  game: Game;
  onViewMoreRelated?: () => void;
}

export function OverviewTab({ game, onViewMoreRelated }: OverviewTabProps) {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isStorylineExpanded, setIsStorylineExpanded] = useState(false);

  const summaryMaxLength = 300;
  const storylineMaxLength = 300;

  const gameSummary = game.summary;
  const truncatedSummary = React.useMemo(() => {
    if (!gameSummary || gameSummary.length <= summaryMaxLength)
      return gameSummary;
    return isAboutExpanded
      ? gameSummary
      : `${gameSummary.slice(0, summaryMaxLength)}...`;
  }, [gameSummary, isAboutExpanded]);

  const gameStoryline = game.storyline;
  const truncatedStoryline = React.useMemo(() => {
    if (!gameStoryline || gameStoryline.length <= storylineMaxLength)
      return gameStoryline;
    return isStorylineExpanded
      ? gameStoryline
      : `${gameStoryline.slice(0, storylineMaxLength)}...`;
  }, [gameStoryline, isStorylineExpanded]);

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
  const relatedGames = game.relatedGames || [];
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
            {gameSummary && gameSummary.length > summaryMaxLength && (
              <Button
                variant="link"
                onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                className="mt-2 text-purple-400 hover:text-purple-300 p-0 h-auto font-semibold"
              >
                {isAboutExpanded ? "Show Less" : "Read More"}
              </Button>
            )}
          </div>
          {gameStoryline && (
            <div>
              <h4 className="text-lg font-semibold mb-2 text-white/90">
                Storyline
              </h4>
              <p className="text-gray-300 leading-relaxed">
                {truncatedStoryline}
              </p>
              {gameStoryline.length > storylineMaxLength && (
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
          {game.first_release_date && getValidYear(game.first_release_date) && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                Release Date
              </h4>
              <p className="text-white font-medium">
                {formatDateSafe(game.first_release_date, "To be announced")}
              </p>
            </div>
          )}

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Gamepad2 className="w-4 h-4 mr-2 text-purple-400" />
                Genres
              </h4>
              <div className="flex flex-wrap gap-2">
                {game.genres.slice(0, 4).map((genre) => (
                  <span
                    key={typeof genre === 'string' ? genre : genre.id || genre.name}
                    className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium transition-colors hover:bg-purple-500/30"
                  >
                    {typeof genre === 'string' ? genre : genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          {game.platforms && game.platforms.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2 text-green-400" />
                Platforms
              </h4>
              <div className="flex flex-wrap gap-2">
                {game.platforms.slice(0, 6).map((platform) => (
                  <span
                    key={typeof platform === 'string' ? platform : platform.id || platform.name}
                    className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium transition-colors hover:bg-green-500/30"
                  >
                    {typeof platform === 'string' ? platform : platform.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Developer/Publisher */}
          {game.involved_companies && game.involved_companies.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Building className="w-4 h-4 mr-2 text-orange-400" />
                Developer
              </h4>
              <div className="space-y-1">
                {game.involved_companies
                  .filter((company) => company.developer)
                  .slice(0, 3)
                  .map((company) => (
                    <p key={company.id} className="text-orange-300 font-medium">
                      {company.company?.name}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Storyline */}
      {game.storyline && (
        <motion.div
          variants={itemVariants}
          className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-md transition-all duration-300 hover:bg-gray-900/50 border border-gray-800/30 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
            <Globe className="w-5 h-5 mr-2 text-cyan-400" />
            Storyline
          </h3>
          <p className="text-gray-300 leading-relaxed text-lg">
            {game.storyline}
          </p>
        </motion.div>
      )}

      {/* Similar Games Preview */}
      {hasRelatedGames && (
        <motion.div
          variants={itemVariants}
          className="bg-gray-900/40 rounded-xl p-6 backdrop-blur-md transition-all duration-300 hover:bg-gray-900/50 border border-gray-800/30 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center text-white">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Related Games
            </h3>
            {relatedGames.length > 4 && onViewMoreRelated && (
              <button
                onClick={onViewMoreRelated}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                View All ({relatedGames.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedGames.slice(0, 4).map((relatedGame) => (
              <motion.div
                key={relatedGame.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800/50 rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:bg-gray-800/70 border border-gray-700/30"
              >
                <Link href={`/game/${relatedGame.id}`}>
                  <div className="relative aspect-[3/4]">
                    {relatedGame.cover && relatedGame.cover.url && (
                      <Image
                        src={ensureAbsoluteUrl(relatedGame.cover.url)}
                        alt={relatedGame.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="p-3">
                    <h4 className="font-medium text-white text-sm mb-1 line-clamp-1">
                      {relatedGame.name}
                    </h4>

                    <div className="flex items-center justify-between">
                      {(relatedGame.rating || relatedGame.total_rating) && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs font-medium text-yellow-400">
                            {((relatedGame.rating || relatedGame.total_rating || 0) / (relatedGame.total_rating ? 1 : 10)).toFixed(1)}
                          </span>
                        </div>
                      )}

                      {getValidYear(relatedGame.first_release_date) && (
                        <span className="text-xs text-gray-400">
                          {getValidYear(relatedGame.first_release_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
