import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { SmartPrefetchLink } from "@/components/ui/navigation/smart-prefetch-link";
import { cn } from "@/lib/utils";

interface GameStatsBreakdown {
  playing: number;
  completed: number;
  backlog: number;
}

interface GamesSectionProps {
  totalGames: number;
  gameStatsBreakdown: GameStatsBreakdown;
}

export const GamesSection = memo<GamesSectionProps>(({ totalGames, gameStatsBreakdown }) => {
  const hasGames = totalGames > 0;

  return (
    <Card className={cn(
      "glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl",
      "hover:border-gray-600/40 transition-all duration-300 group"
    )}>
      <CardContent className="p-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Gamepad2 className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Games</h3>
              <p className="text-xs text-gray-500 mt-0.5">Your collection</p>
            </div>
          </div>
          
          {/* Action button */}
          <SmartPrefetchLink href="/profile/games" prefetchStrategy="hover" priority={true}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "profile-nav-item touch-feedback",
                "text-gray-400 hover:text-white hover:bg-white/10",
                "transition-all duration-200 rounded-lg group/btn"
              )}
            >
              {hasGames ? (
                <>
                  View All
                  <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              ) : (
                <>
                  Add Games
                  <Plus className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </SmartPrefetchLink>
        </div>

        {/* Content */}
        {hasGames ? (
          <div className="space-y-4">
            {/* Primary stat display */}
            <div className="bg-white/5 rounded-xl p-4 group-hover:bg-white/8 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 font-medium">Total Games</p>
                  <p className="text-2xl font-bold text-white tabular-nums">{totalGames}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Gamepad2 className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors duration-300">
                <div className="text-sm font-semibold text-white tabular-nums">
                  {gameStatsBreakdown.playing}
                </div>
                <div className="text-xs text-gray-400 mt-1">Playing</div>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors duration-300">
                <div className="text-sm font-semibold text-white tabular-nums">
                  {gameStatsBreakdown.completed}
                </div>
                <div className="text-xs text-gray-400 mt-1">Completed</div>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors duration-300">
                <div className="text-sm font-semibold text-white tabular-nums">
                  {gameStatsBreakdown.backlog}
                </div>
                <div className="text-xs text-gray-400 mt-1">Backlog</div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state with encouraging design */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto">
              <Plus className="h-6 w-6 text-gray-500" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium tracking-tight">
                Start Your Collection
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Add games to track your progress, rate experiences, and build your gaming journey.
              </p>
            </div>
            
            {/* Call-to-action */}
            <div className="pt-2">
              <Link href="/profile/games">
                <div className="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">
                  <Plus className="h-3 w-3 mr-1" />
                  Browse games to add
                </div>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

GamesSection.displayName = 'GamesSection';