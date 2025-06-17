"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaylistTypeIcon } from "@/components/admin/playlist/shared/PlaylistTypeIcon";
import { formatPlaylistDate } from "@/lib/playlist-utils";
import type { Playlist } from "@/types/playlist";

interface PlaylistStats {
  avgRating: number;
  totalPlaytime: number;
}

interface PlaylistDetailsTabProps {
  playlist: Playlist;
  stats: PlaylistStats;
}

export const PlaylistDetailsTab: React.FC<PlaylistDetailsTabProps> = ({
  playlist,
  stats,
}) => {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-xl font-semibold text-white">
          Playlist Information
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/80">
                Created
              </label>
              <p className="text-white">
                {formatPlaylistDate(playlist.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">
                Last Updated
              </label>
              <p className="text-white">
                {formatPlaylistDate(
                  playlist.updatedAt || playlist.createdAt
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">
                Type
              </label>
              <div className="flex items-center gap-2">
                <PlaylistTypeIcon type={playlist.type} />
                <Badge variant="secondary" className="capitalize">
                  {playlist.type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/80">
                Total Games
              </label>
              <p className="text-white">
                {playlist.games?.length || 0}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">
                Average Rating
              </label>
              <p className="text-white">{stats.avgRating}/10</p>
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">
                Estimated Playtime
              </label>
              <p className="text-white">{stats.totalPlaytime} hours</p>
            </div>
          </div>
        </div>

        {playlist.metadata?.tags &&
          playlist.metadata.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-white/80 block mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {playlist.metadata.tags.map(
                  (tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-white/20 text-white/80"
                    >
                      {tag}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
};