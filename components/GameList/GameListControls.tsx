"use client";

import { memo } from "react";
import { Input } from "@/components/ui/input";

interface GameListControlsProps {
  searchTerm: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export const GameListControls = memo<GameListControlsProps>(function GameListControls({ 
  searchTerm, 
  sortBy, 
  onSearchChange, 
  onSortChange 
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          {/* Search input with your app's dark theme */}
          <Input
            placeholder="Find in playlist"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-white/10 text-white placeholder:text-gray-400 border border-white/20 rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
          />
        </div>
        
        {/* Dropdown with your app's dark theme */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-white/10 text-white border border-white/20 rounded-md px-3 py-2 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
        >
          <option value="author_rank" className="bg-gray-900 text-white">Author Rank</option>
          <option value="recently_added" className="bg-gray-900 text-white">Recently Added</option>
          <option value="alphabetical_az" className="bg-gray-900 text-white">Alphabetical - A to Z</option>
          <option value="alphabetical_za" className="bg-gray-900 text-white">Alphabetical - Z to A</option>
        </select>
      </div>
    </div>
  );
});