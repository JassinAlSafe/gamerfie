"use client";

import React, { useState } from "react";
import { BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Game } from "@/types/game";

interface OverviewTabProps {
  game: Game;
}

export function OverviewTab({ game }: OverviewTabProps) {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isStorylineExpanded, setIsStorylineExpanded] = useState(false);

  const summaryMaxLength = 300;
  const storylineMaxLength = 300;

  const truncatedSummary = React.useMemo(() => {
    if (!game.summary || game.summary.length <= summaryMaxLength)
      return game.summary;
    return isAboutExpanded
      ? game.summary
      : `${game.summary.slice(0, summaryMaxLength)}...`;
  }, [game.summary, isAboutExpanded]);

  const truncatedStoryline = React.useMemo(() => {
    if (!game.storyline || game.storyline.length <= storylineMaxLength)
      return game.storyline;
    return isStorylineExpanded
      ? game.storyline
      : `${game.storyline.slice(0, storylineMaxLength)}...`;
  }, [game.storyline, isStorylineExpanded]);

  return (
    <div className="space-y-8">
      {/* About */}
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
          <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
          About
        </h3>
        <div className="space-y-6">
          <div>
            <p className="text-gray-300 leading-relaxed">{truncatedSummary}</p>
            {game.summary && game.summary.length > summaryMaxLength && (
              <Button
                variant="link"
                onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                className="mt-2 text-purple-400 hover:text-purple-300 p-0 h-auto font-semibold"
              >
                {isAboutExpanded ? "Show Less" : "Read More"}
              </Button>
            )}
          </div>
          {game.storyline && (
            <div>
              <h4 className="text-lg font-semibold mb-2">Storyline</h4>
              <p className="text-gray-300 leading-relaxed">
                {truncatedStoryline}
              </p>
              {game.storyline.length > storylineMaxLength && (
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
      </div>

      {/* Features */}
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {game.genres && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <Badge
                    key={genre.id}
                    variant="secondary"
                    className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors duration-200 px-4 py-2 rounded-full text-sm"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {game.platforms && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                Platforms
              </h4>
              <div className="flex flex-wrap gap-2">
                {game.platforms.map((platform) => (
                  <Badge
                    key={platform.id}
                    variant="secondary"
                    className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors duration-200 px-4 py-2 rounded-full text-sm"
                  >
                    {platform.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
