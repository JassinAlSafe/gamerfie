"use client";

import React, { useState } from "react";
import { Star, Gamepad2, Calendar, Filter, X, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Genre {
  id: string;
  name: string;
}

interface Platform {
  id: string;
  name: string;
}

interface QuickFiltersProps {
  // Rating filter
  minRating: number | null;
  maxRating: number | null;
  onRatingChange: (min: number | null, max: number | null) => void;
  
  // Genre filter
  selectedGenre: string;
  genres: Genre[];
  onGenreChange: (genreId: string) => void;
  
  // Platform filter  
  selectedPlatform: string;
  platforms: Platform[];
  onPlatformChange: (platformId: string) => void;
  
  // Release period filter
  selectedYear: string;
  onYearChange: (year: string) => void;
  
  // Multiplayer filter
  hasMultiplayer: boolean;
  onMultiplayerChange: (hasMultiplayer: boolean) => void;
  
  // Clear filters
  onClearFilters: () => void;
  
  // Active filters count
  activeFiltersCount: number;
  
  // Games count for display
  totalGames: number;
  searchQuery: string;
}

export function QuickFilters({
  minRating,
  onRatingChange,
  selectedGenre,
  genres,
  onGenreChange,
  selectedPlatform,
  platforms,
  onPlatformChange,
  selectedYear,
  onYearChange,
  hasMultiplayer,
  onMultiplayerChange,
  onClearFilters,
  activeFiltersCount,
  totalGames,
  searchQuery
}: QuickFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const popularGenres = genres.slice(0, 5); // Further reduced to 5 for cleaner layout
  const popularPlatforms = platforms.slice(0, 3); // Further reduced to 3 for cleaner layout

  const handleRatingClick = (rating: number) => {
    if (minRating === rating) {
      // If clicking the same rating, clear it
      onRatingChange(null, null);
    } else {
      // Set minimum rating
      onRatingChange(rating, null);
    }
  };
  const yearOptions = [
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2020s", label: "2020s" },
    { value: "2010s", label: "2010s" },
    { value: "retro", label: "Retro" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 rounded-lg border border-gray-800/50 p-4 space-y-3"
    >
      {/* Header with count and toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-300 font-medium">Quick Filters</span>
          <span className="text-xs text-gray-500">
            Showing {totalGames.toLocaleString()} game{totalGames !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-gray-400 hover:text-white h-8 px-3"
            >
              Clear All ({activeFiltersCount})
            </Button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-md"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Show</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters Content - Collapsible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Rating Filter Chips */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300 font-medium">Rating:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[9, 8, 7, 6].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      minRating === rating
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-yellow-300 border border-gray-700/30"
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    <span>{rating}+</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter Chips */}
            {popularGenres.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full" />
                    <span className="text-sm text-gray-300 font-medium">Genres:</span>
                  </div>
                  {genres.length > 5 && (
                    <span className="text-xs text-gray-500">+{genres.length - 5} more</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {popularGenres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => onGenreChange(selectedGenre === genre.id ? "all" : genre.id)}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        selectedGenre === genre.id
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-purple-300 border border-gray-700/30"
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Filter Chips */}
            {popularPlatforms.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300 font-medium">Platforms:</span>
                  </div>
                  {platforms.length > 3 && (
                    <span className="text-xs text-gray-500">+{platforms.length - 3} more</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {popularPlatforms.map((platform) => {
                    // Shorten platform names
                    const shortName = platform.name
                      .replace('Advanced Programmable Video System', 'APVS')
                      .replace('3DO Interactive Multiplayer', '3DO')
                      .replace('Acorn Archimedes', 'Archimedes')
                      .replace('Acorn Electron', 'Electron')
                      .replace('Advanced Pico Beena', 'Pico Beena')
                      .replace('PlayStation', 'PS')
                      .replace('Nintendo', 'Nintendo')
                      .replace('Xbox', 'Xbox');
                    
                    return (
                      <button
                        key={platform.id}
                        onClick={() => onPlatformChange(selectedPlatform === platform.id ? "all" : platform.id)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                          selectedPlatform === platform.id
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-blue-300 border border-gray-700/30"
                        }`}
                      >
                        {shortName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Compact Row: Release Period & Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Release Period Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300 font-medium">Release:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {yearOptions.slice(0, 3).map((year) => (
                    <button
                      key={year.value}
                      onClick={() => onYearChange(selectedYear === year.value ? "all" : year.value)}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        selectedYear === year.value
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-green-300 border border-gray-700/30"
                      }`}
                    >
                      {year.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300 font-medium">Features:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => onMultiplayerChange(!hasMultiplayer)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                      hasMultiplayer
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-orange-300 border border-gray-700/30"
                    }`}
                  >
                    Multiplayer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 pt-3 border-t border-gray-800/50"
          >
            <span className="text-xs text-gray-400 self-center">Active filters:</span>
            
            {minRating && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                {minRating}+ Rating
                <button
                  onClick={() => onRatingChange(null, null)}
                  className="ml-2 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {selectedGenre !== "all" && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {genres.find(g => g.id === selectedGenre)?.name || selectedGenre}
                <button
                  onClick={() => onGenreChange("all")}
                  className="ml-2 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {selectedPlatform !== "all" && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {platforms.find(p => p.id === selectedPlatform)?.name || selectedPlatform}
                <button
                  onClick={() => onPlatformChange("all")}
                  className="ml-2 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {selectedYear !== "all" && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                {yearOptions.find(y => y.value === selectedYear)?.label || selectedYear}
                <button
                  onClick={() => onYearChange("all")}
                  className="ml-2 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {hasMultiplayer && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Multiplayer
                <button
                  onClick={() => onMultiplayerChange(false)}
                  className="ml-2 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}