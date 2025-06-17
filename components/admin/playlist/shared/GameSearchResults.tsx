"use client";

import React, { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameThumbnail } from "./GameThumbnail";
import { cn } from "@/lib/utils";

interface Game {
  id: string;
  name: string;
  cover_url?: string | null;
  background_image?: string | null;
  cover?: { id: string; url: string } | string;
  released?: string;
  total_rating?: number;
  genres?: Array<{ name: string } | string>;
  dataSource?: 'igdb' | 'rawg';
}

interface GameSearchResultsProps {
  games: Game[];
  isLoading: boolean;
  searchQuery: string;
  selectedGameIds: string[];
  onAddGame: (game: Game) => Promise<void>;
  onBatchAdd?: (games: Game[]) => void;
  showBatchActions?: boolean;
  maxBatchSize?: number;
}

export const GameSearchResults: React.FC<GameSearchResultsProps> = ({
  games,
  isLoading,
  searchQuery,
  selectedGameIds,
  onAddGame,
  onBatchAdd,
  showBatchActions = true,
  maxBatchSize = 5,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">
          Searching across game databases...
        </p>
      </div>
    );
  }

  if (games.length === 0 && searchQuery) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <Search className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          No games found for "{searchQuery}"
        </p>
        <p className="text-xs text-muted-foreground">
          Try different keywords or check spelling
        </p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Search for games to add
        </p>
        <p className="text-xs text-muted-foreground">
          Start typing to find games from our database
        </p>
      </div>
    );
  }

  const availableGames = games.filter(game => !selectedGameIds.includes(game.id));

  return (
    <div className="space-y-3">
      {/* Batch actions header */}
      {showBatchActions && availableGames.length > 0 && onBatchAdd && (
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {games.length} results found
              {games.some(g => g.dataSource === 'igdb') && 
               games.some(g => g.dataSource === 'rawg') && 
               ' from IGDB & RAWG'
              }
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBatchAdd(availableGames.slice(0, maxBatchSize))}
            disabled={availableGames.length === 0}
            className="gap-1 h-7 text-xs"
          >
            <Plus className="w-3 h-3" />
            Add Top {Math.min(maxBatchSize, availableGames.length)}
          </Button>
        </div>
      )}

      {/* Game results */}
      <div className="space-y-2">
        {games.map((game) => (
          <GameSearchItem
            key={game.id}
            game={game}
            onAdd={() => onAddGame(game)}
            isAdded={selectedGameIds.includes(game.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Individual game search item component
interface GameSearchItemProps {
  game: Game;
  onAdd: () => Promise<void>;
  isAdded: boolean;
}

const GameSearchItem: React.FC<GameSearchItemProps> = ({
  game,
  onAdd,
  isAdded,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAdd();
    } finally {
      setIsAdding(false);
    }
  };

  const getSourceBadge = () => {
    const source = game.dataSource || (game.id.startsWith('igdb_') ? 'igdb' : 'rawg');
    return source === 'igdb' ? (
      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
        IGDB
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
        RAWG
      </Badge>
    );
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 border rounded-lg transition-all duration-200",
        "hover:bg-muted/50 hover:shadow-sm hover:border-primary/20",
        isHovered && "transform scale-[1.01]",
        isAdded && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <GameThumbnail
          game={game}
          size="md"
          showSourceIndicator={false}
          className="shadow-sm"
        />
        {/* Quality indicator */}
        <div className="absolute -top-1 -right-1">
          {getSourceBadge()}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium text-sm truncate">{game.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {game.released && (
            <span>{new Date(game.released).getFullYear()}</span>
          )}
          {game.total_rating && (
            <>
              <span>•</span>
              <span>★ {Math.round(game.total_rating / 10)}/10</span>
            </>
          )}
        </div>
        {game.genres && game.genres.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {game.genres.slice(0, 2).map((genre, index) => (
              <Badge key={index} variant="outline" className="text-xs py-0 px-1">
                {typeof genre === 'string' ? genre : genre.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button
        variant={isAdded ? "secondary" : "default"}
        size="sm"
        onClick={handleAdd}
        disabled={isAdded || isAdding}
        className={cn(
          "gap-1 min-w-[80px] transition-all",
          !isAdded && "hover:bg-primary/90",
          isAdded && "cursor-default"
        )}
      >
        {isAdding ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
        ) : isAdded ? (
          <>
            <X className="w-3 h-3" />
            Added
          </>
        ) : (
          <>
            <Plus className="w-3 h-3" />
            Add
          </>
        )}
      </Button>
    </div>
  );
};