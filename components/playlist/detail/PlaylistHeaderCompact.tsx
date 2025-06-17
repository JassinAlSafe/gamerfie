"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTypeColor, formatPlaylistDate } from "@/lib/playlist-utils";
import { PlaylistTypeIcon } from "@/components/admin/playlist/shared/PlaylistTypeIcon";
import { GameThumbnailStack } from "@/components/admin/playlist/shared/GameThumbnail";
import type { Playlist } from "@/types/playlist";

interface PlaylistStats {
  views: number;
  totalGames: number;
  avgRating: number;
  totalPlaytime: number;
  likes: number;
  bookmarks: number;
}

interface PlaylistHeaderCompactProps {
  playlist: Playlist;
  stats: PlaylistStats;
}

export const PlaylistHeaderCompact: React.FC<PlaylistHeaderCompactProps> = ({
  playlist,
  stats,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      {/* Left side - Main info */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={cn("w-1 h-8 rounded-full", getTypeColor(playlist.type))}
          />
          <div className="flex items-center gap-2">
            <PlaylistTypeIcon type={playlist.type} />
            <Badge variant="secondary" className="capitalize text-xs">
              {playlist.type}
            </Badge>
            {playlist.isPublished && (
              <Badge
                variant="outline"
                className="border-green-500/50 text-green-400 text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Published
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
            {playlist.title}
          </h1>
          <p className="text-base text-white/70 line-clamp-2">
            {playlist.description}
          </p>
        </div>

        {/* Compact metadata row */}
        <div className="flex items-center gap-6 text-sm text-white/60">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatPlaylistDate(playlist.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {stats.views.toLocaleString()} views
          </span>
          <span>
            {playlist.games?.length || 0} game{playlist.games?.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Game thumbnails preview - compact */}
        {playlist.games && playlist.games.length > 0 && (
          <div className="flex items-center gap-3">
            <GameThumbnailStack
              games={playlist.games}
              maxVisible={4}
              size="sm"
              showCount={true}
            />
          </div>
        )}
      </div>

      {/* Right side - Compact stats */}
      <div className="flex lg:flex-col gap-4 lg:gap-3">
        <div className="text-center px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm min-w-[80px]">
          <div className="text-xl font-bold text-white">
            {stats.likes > 999 ? `${(stats.likes / 1000).toFixed(1)}k` : stats.likes}
          </div>
          <div className="text-xs text-white/60">Likes</div>
        </div>
        <div className="text-center px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm min-w-[80px]">
          <div className="text-xl font-bold text-white">
            {stats.bookmarks > 999 ? `${(stats.bookmarks / 1000).toFixed(1)}k` : stats.bookmarks}
          </div>
          <div className="text-xs text-white/60">Saves</div>
        </div>
        <div className="text-center px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm min-w-[80px]">
          <div className="text-xl font-bold text-white">
            {stats.avgRating}/10
          </div>
          <div className="text-xs text-white/60">Rating</div>
        </div>
        <div className="text-center px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm min-w-[80px]">
          <div className="text-xl font-bold text-white">
            {stats.totalPlaytime}h
          </div>
          <div className="text-xs text-white/60">Playtime</div>
        </div>
      </div>
    </div>
  );
};