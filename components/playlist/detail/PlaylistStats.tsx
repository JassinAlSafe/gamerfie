"use client";

import React from "react";

interface PlaylistStatsData {
  totalGames: number;
  avgRating: number;
  totalPlaytime: number;
  completionRate: number;
  likes: number;
  bookmarks: number;
  views: number;
}

interface PlaylistStatsProps {
  stats: PlaylistStatsData;
}

export const PlaylistStats: React.FC<PlaylistStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:min-w-[200px]">
      <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm">
        <div className="text-2xl font-bold text-white">
          {stats.likes.toLocaleString()}
        </div>
        <div className="text-sm text-white/60">Likes</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm">
        <div className="text-2xl font-bold text-white">
          {stats.bookmarks.toLocaleString()}
        </div>
        <div className="text-sm text-white/60">Bookmarks</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm">
        <div className="text-2xl font-bold text-white">
          {stats.avgRating}/10
        </div>
        <div className="text-sm text-white/60">Avg Rating</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm">
        <div className="text-2xl font-bold text-white">
          {stats.totalPlaytime}h
        </div>
        <div className="text-sm text-white/60">Total Playtime</div>
      </div>
    </div>
  );
};