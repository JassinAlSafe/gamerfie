"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Share2, MessageCircle } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCoverImageUrl } from "@/utils/image-utils";
import { calculateGameStats, formatListDate, getUserInitials } from "@/utils/game-list-details-utils";

import type { GameList } from "@/types/gamelist/game-list";

interface GameListHeroProps {
  list: GameList;
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  onShare: () => void;
}

export const GameListHero = memo<GameListHeroProps>(function GameListHero({
  list,
  isLiked,
  likeCount,
  onLike,
  onShare
}) {
  const gameStats = useMemo(() => calculateGameStats(list.games), [list.games]);
  
  // Use first game's cover as hero background if available
  const heroBackground = list.games?.[0]?.cover_url ? getCoverImageUrl(list.games[0].cover_url) : null;
  
  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-white/10">
      {/* Hero Background Image - IGN Style */}
      {heroBackground && (
        <div className="absolute inset-0">
          <Image
            src={heroBackground}
            alt={list.title}
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
        </div>
      )}
      
      {/* Fallback gradient background */}
      {!heroBackground && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-purple-900/40" />
      )}
      
      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Main Info */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              {/* IGN-style large title - exact font specs */}
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                {list.title}
              </h1>
              
              <div className="flex items-center gap-4 text-gray-300">
                <Link href={`/profile/${list.user_id}`} className="group flex items-center gap-3 hover:text-white transition-colors">
                  <Avatar className="w-12 h-12 group-hover:ring-2 ring-purple-400 transition-all">
                    <AvatarImage src={list.user?.avatar_url || ""} />
                    <AvatarFallback className="bg-purple-600 text-white text-lg">
                      {getUserInitials(list.user?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-lg font-medium">
                    {list.user?.username}
                  </span>
                </Link>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">
                  Updated {formatListDate(list.updatedAt)}
                </span>
              </div>
            </div>

            {list.content && list.content.trim() && !list.content.startsWith('[{') && (
              <p className="text-gray-200 text-xl leading-relaxed max-w-3xl">
                {list.content}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={onLike}
                className={cn(
                  "bg-white/5 border-white/20 hover:bg-white/10 transition-all text-white font-medium px-6",
                  isLiked && "bg-purple-500/20 border-purple-400 hover:bg-purple-500/30 text-purple-300"
                )}
              >
                <Heart
                  className={cn("w-5 h-5 mr-2", isLiked && "fill-current text-purple-400")}
                />
                {likeCount > 0 ? likeCount : "Like"}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={onShare}
                className="bg-white/5 border-white/20 hover:bg-white/10 transition-all text-white font-medium px-6"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/5 border-white/20 hover:bg-white/10 transition-all text-white font-medium px-6"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Comments
              </Button>
            </div>
          </div>

          {/* Stats Panel - IGN exact style */}
          <div className="flex lg:flex-col gap-6 lg:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 min-w-[120px] text-center">
              <div className="text-2xl lg:text-3xl font-black text-white mb-0">
                {gameStats.total}
              </div>
              <div className="text-xs text-gray-300 lowercase">
                games
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 min-w-[120px] text-center">
              <div className="text-2xl lg:text-3xl font-black text-white mb-0">
                {gameStats.estimatedHours} hrs
              </div>
              <div className="text-xs text-gray-300 lowercase">
                HowLongToBeat™
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 min-w-[120px] text-center">
              <div className="text-2xl lg:text-3xl font-black text-white mb-0">
                {likeCount}
              </div>
              <div className="text-xs text-gray-300 lowercase">
                followers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});