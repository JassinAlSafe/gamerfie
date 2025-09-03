"use client";

import { memo, useMemo } from "react";
import { GameListCard } from "./GameListCard";
import { GameListEmptyState } from "./GameListEmptyState";
import { calculateGameStats } from "@/utils/game-list-details-utils";

import type { GameListItem } from "@/types/gamelist/game-list";

interface GameListGridProps {
  games: GameListItem[];
  searchTerm?: string;
  sortBy?: string;
}

export const GameListGrid = memo<GameListGridProps>(function GameListGrid({ 
  games, 
  searchTerm = "", 
  sortBy = "author_rank" 
}) {
  const gameStats = useMemo(() => calculateGameStats(games), [games]);

  // Filter and sort games based on controls
  const processedGames = useMemo(() => {
    let filtered = games;
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recently_added":
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
        case "alphabetical_az":
          return a.name.localeCompare(b.name);
        case "alphabetical_za":
          return b.name.localeCompare(a.name);
        case "release_date_new":
        case "release_date_old":
          // Release date sorting is not available as this data is not stored in GameListItem
          return 0;
        default: // author_rank
          return 0; // Keep original order
      }
    });
  }, [games, searchTerm, sortBy]);

  if (gameStats.isEmpty) {
    return <GameListEmptyState variant="games" />;
  }

  return (
    <div className="space-y-6">
      {/* Games Grid - IGN exact layout */}
      <div className="grid gap-4" style={{ 
        gridTemplateColumns: 'repeat(auto-fill, minmax(201px, 1fr))',
        justifyItems: 'center'
      }}>
        {processedGames.map((game) => (
          <GameListCard key={game.id} game={game} />
        ))}
      </div>

      {searchTerm && processedGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No games found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
});