"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GameCard } from "@/components/shared/GameCard/GameCard";
import { Grid3X3, List, SortAsc } from "lucide-react";

type ViewMode = "grid" | "list";
type SortOption = "default" | "name" | "rating" | "release" | "popularity";

interface PlaylistGamesSectionProps {
  games: any[];
  viewMode: ViewMode;
  sortBy: SortOption;
  searchQuery: string;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortOption) => void;
  onSearchChange: (query: string) => void;
}

export const PlaylistGamesSection: React.FC<PlaylistGamesSectionProps> = ({
  games,
  viewMode,
  sortBy,
  searchQuery,
  onViewModeChange,
  onSortChange,
  onSearchChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs bg-white/5 border-white/10 text-white placeholder:text-white/50 h-9"
          />
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white h-9">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Order</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="release">Newest First</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="text-white h-9 px-3"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="text-white h-9 px-3"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Games Grid/List */}
      <AnimatePresence mode="wait">
        {games.length > 0 ? (
          <motion.div
            key={`${viewMode}-${sortBy}-${searchQuery}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-2"
            }
          >
            {games.map((game) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <GameCard
                  game={game}
                  variant={viewMode}
                  showActions={true}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid3X3 className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 mb-2">
              {searchQuery
                ? "No games match your search"
                : "No games in this playlist yet"}
            </p>
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => onSearchChange("")}
                className="text-white/80"
              >
                Clear search
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};