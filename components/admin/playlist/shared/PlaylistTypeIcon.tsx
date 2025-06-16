"use client";

import React from "react";
import { Star, Grid3X3, Calendar, Gamepad2, List } from "lucide-react";
import { PlaylistType } from "@/types/playlist";

const PLAYLIST_ICONS = {
  featured: Star,
  collection: Grid3X3,
  event: Calendar,
  genre: Gamepad2,
  custom: List,
} as const;

interface PlaylistTypeIconProps {
  type: PlaylistType;
  className?: string;
}

export const PlaylistTypeIcon: React.FC<PlaylistTypeIconProps> = ({ type, className = "w-4 h-4" }) => {
  const Icon = PLAYLIST_ICONS[type] || List;
  return <Icon className={className} />;
};