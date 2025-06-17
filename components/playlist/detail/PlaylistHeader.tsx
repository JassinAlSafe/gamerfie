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
}

interface PlaylistHeaderProps {
  playlist: Playlist;
  stats: PlaylistStats;
}

export const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  playlist,
  stats,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-3">
          <div
            className={cn("w-1 h-8 rounded-full", getTypeColor(playlist.type))}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PlaylistTypeIcon type={playlist.type} />
              <Badge variant="secondary" className="capitalize">
                {playlist.type}
              </Badge>
              {playlist.isPublished && (
                <Badge
                  variant="outline"
                  className="border-green-500/50 text-green-400"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Published
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatPlaylistDate(playlist.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {stats.views.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">{playlist.title}</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            {playlist.description}
          </p>
        </div>

        {/* Game thumbnails preview */}
        {playlist.games && playlist.games.length > 0 && (
          <div className="flex items-center gap-4">
            <GameThumbnailStack
              games={playlist.games}
              maxVisible={5}
              size="md"
              showCount={true}
            />
            <span className="text-white/60">
              {playlist.games.length} game
              {playlist.games.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};