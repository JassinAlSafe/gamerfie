"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { getPlaylistTypeConfig } from "@/lib/playlist-utils";
import { PlaylistType } from "@/types/playlist";

interface PlaylistStatusBadgeProps {
  type: PlaylistType;
  isPublished?: boolean;
  showType?: boolean;
  showStatus?: boolean;
}

export const PlaylistStatusBadge: React.FC<PlaylistStatusBadgeProps> = ({
  type,
  isPublished = true,
  showType = true,
  showStatus = true
}) => {
  const config = getPlaylistTypeConfig(type);
  
  return (
    <div className="flex items-center gap-2">
      {showType && (
        <Badge variant="secondary" className="text-xs">
          {config.label}
        </Badge>
      )}
      {showStatus && !isPublished && (
        <Badge variant="outline" className="text-xs">
          Draft
        </Badge>
      )}
    </div>
  );
};