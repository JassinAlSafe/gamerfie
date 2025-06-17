"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Bookmark, Calendar, Eye, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPlaylistDate } from "@/lib/playlist-utils";
import type { Playlist } from "@/types/playlist";

interface PlaylistStats {
  views: number;
  totalGames: number;
  avgRating: number;
  totalPlaytime: number;
  likes: number;
  bookmarks: number;
}

interface PlaylistHeroModernProps {
  playlist: Playlist;
  stats: PlaylistStats;
  isBookmarked: boolean;
  isLiked: boolean;
  onShare: () => void;
  onBookmark: () => void;
  onLike: () => void;
  interactionsLoading?: boolean;
}

export const PlaylistHeroModern: React.FC<PlaylistHeroModernProps> = ({
  playlist,
  stats,
  isBookmarked,
  isLiked,
  onShare,
  onBookmark,
  onLike,
  interactionsLoading = false,
}) => {
  const featuredGame = playlist.games?.[0];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Image */}
      {featuredGame && (
        <div className="absolute inset-0">
          <Image
            src={featuredGame.background_image || featuredGame.cover_url || "/api/placeholder/1920/800"}
            alt={featuredGame.name}
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 lg:py-16">
        <div className="max-w-4xl">
          {/* Type & Status */}
          <div className="flex items-center gap-3 mb-6">
            <Badge 
              variant="secondary" 
              className="bg-white/10 text-white border-0 font-medium text-sm px-3 py-1"
            >
              {playlist.type}
            </Badge>
            {playlist.isPublished && (
              <Badge 
                variant="outline" 
                className="border-emerald-400/50 text-emerald-400 bg-emerald-400/10 text-sm px-3 py-1"
              >
                Published
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {playlist.title}
          </h1>

          {/* Description */}
          <p className="text-lg lg:text-xl text-slate-300 mb-6 max-w-2xl leading-relaxed">
            {playlist.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-6 mb-8 text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatPlaylistDate(playlist.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{stats.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span className="text-sm">{playlist.games?.length || 0} games</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm">★ {stats.avgRating}/10</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-semibold px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={onLike}
              disabled={interactionsLoading}
              className={cn(
                "border-white/20 text-white hover:bg-white/10 transition-all duration-200",
                isLiked && "bg-red-500/20 border-red-500/50 text-red-400",
                interactionsLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              <Heart className={cn("w-5 h-5 mr-2 transition-all duration-200", isLiked && "fill-current")} />
              {stats.likes > 999 ? `${(stats.likes / 1000).toFixed(1)}k` : stats.likes}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onBookmark}
              disabled={interactionsLoading}
              className={cn(
                "border-white/20 text-white hover:bg-white/10 transition-all duration-200",
                isBookmarked && "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
                interactionsLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              <Bookmark className={cn("w-5 h-5 transition-all duration-200", isBookmarked && "fill-current")} />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onShare}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-8 mt-8 lg:mt-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.bookmarks > 999 ? `${(stats.bookmarks / 1000).toFixed(1)}k` : stats.bookmarks}
              </div>
              <div className="text-sm text-slate-400">Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.avgRating}/10
              </div>
              <div className="text-sm text-slate-400">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.totalPlaytime}h
              </div>
              <div className="text-sm text-slate-400">Playtime</div>
            </div>
          </div>
        </div>

        {/* Game Preview Carousel (minimal) */}
        {playlist.games && playlist.games.length > 1 && (
          <div className="mt-12 lg:mt-16">
            <div className="flex items-center gap-4 overflow-x-auto pb-4">
              {playlist.games.slice(0, 6).map((game, index) => (
                <div 
                  key={game.id} 
                  className="relative flex-shrink-0 w-24 h-32 lg:w-32 lg:h-44 rounded-lg overflow-hidden group cursor-pointer"
                >
                  <Image
                    src={game.cover_url || game.background_image || "/api/placeholder/300/400"}
                    alt={game.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
              {playlist.games.length > 6 && (
                <div className="flex-shrink-0 w-24 h-32 lg:w-32 lg:h-44 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-white/60 text-sm font-medium">
                    +{playlist.games.length - 6}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};