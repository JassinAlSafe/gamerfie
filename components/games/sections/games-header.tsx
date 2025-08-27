"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Filter,
  X,
  Gamepad2,
  LayoutGrid,
  List,
  Star,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGamesStore } from "@/stores/useGamesStore";
import { GamesFilterDropdown } from "../filters/games-filter-dropdown";
import { GameSearchWithSuggestions } from "../GameSearchWithSuggestions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { useUrlParams } from "@/hooks/Settings/useUrlParams";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GamesHeaderProps {
  games?: any[];
}

export function GamesHeader({ games = [] }: GamesHeaderProps = {}) {
  const [isQuickFiltersExpanded, setIsQuickFiltersExpanded] = useState(false);
  const gamesStore = useGamesStore();
  const { resetFiltersAndUrl } = useUrlParams();
  const {
    sortBy = 'popularity',
    setSortBy,
    selectedPlatform,
    selectedGenre,
    selectedCategory,
    selectedYear,
    timeRange,
    selectedGameMode,
    selectedTheme,
    minRating,
    maxRating,
    hasMultiplayer,
    platforms,
    genres,
    setSelectedPlatform,
    setSelectedGenre,
    setSelectedYear,
    setTimeRange,
    setSelectedGameMode,
    setSelectedTheme,
    setRatingRange,
    setHasMultiplayer,
    totalGames,
    searchQuery,
    setSearchQuery,
  } = gamesStore;

  const { viewMode, setViewMode } = useViewModeStore();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedPlatform !== "all" ||
    selectedGenre !== "all" ||
    selectedCategory !== "all" ||
    selectedYear !== "all" ||
    timeRange !== "all" ||
    selectedGameMode !== "all" ||
    selectedTheme !== "all" ||
    minRating !== null ||
    maxRating !== null ||
    hasMultiplayer ||
    sortBy !== "popularity" ||
    searchQuery !== "";

  // Count active quick filters
  const activeQuickFiltersCount = [
    minRating !== null,
    selectedGenre !== "all",
    selectedPlatform !== "all", 
    selectedYear !== "all",
    hasMultiplayer
  ].filter(Boolean).length;

  // Quick filter handlers
  const handleRatingClick = (rating: number) => {
    // Convert UI rating (1-10 scale) to IGDB rating (0-100 scale)
    const igdbRating = rating * 10;
    if (minRating === igdbRating) {
      setRatingRange(null, null);
    } else {
      setRatingRange(igdbRating, null);
    }
  };

  const clearQuickFilters = () => {
    setRatingRange(null, null);
    setSelectedGenre("all");
    setSelectedPlatform("all");
    setSelectedYear("all");
    setHasMultiplayer(false);
  };

  // Get platform name for display
  const getPlatformName = () => {
    if (selectedPlatform === "all") return null;
    const platform = platforms.find((p) => p.id === selectedPlatform);
    return platform?.name || null;
  };

  // Get genre name for display
  const getGenreName = () => {
    if (selectedGenre === "all") return null;
    const genre = genres.find((g) => g.id === selectedGenre);
    return genre?.name || null;
  };

  return (
    <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
      <div className="container mx-auto max-w-[2000px]">
        {/* Top Bar with gradient background */}
        <div className="relative rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-900/90 via-gray-900/95 to-gray-900/90 shadow-lg border border-gray-800/50 p-3 sm:p-4 mb-4">
          <div
            className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] rounded-xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/explore">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-800/70 text-gray-400 hover:text-white"
                    aria-label="Back to Explore"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Gamepad2
                      className="h-5 w-5 text-purple-400"
                      aria-hidden="true"
                    />
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      Browse Games
                    </h1>
                  </div>
                  {totalGames > 0 && (
                    <span className="text-sm text-gray-300">
                      {totalGames.toLocaleString()} titles available
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Search with Suggestions */}
            <GameSearchWithSuggestions
              value={searchQuery}
              onChange={handleSearchChange}
              games={games}
              className="w-full"
              placeholder="Search games, genres, developers..."
            />
          </div>
        </div>

        {/* Enhanced Filters Bar with Quick Filters */}
        <div className="bg-gray-900/30 rounded-lg border border-gray-800/30 p-3 sm:p-4">
          {/* Top Controls Row */}
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-800/70 border border-gray-700/50 rounded-full p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-8 w-8 p-0 rounded-full",
                    viewMode === "grid"
                      ? "bg-purple-500/30 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  )}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "h-8 w-8 p-0 rounded-full",
                    viewMode === "list"
                      ? "bg-purple-500/30 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  )}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[120px] sm:min-w-[140px] justify-between bg-gray-800/70 border-gray-700/50 hover:bg-gray-700/70 rounded-full text-xs sm:text-sm"
                      aria-label="Sort games"
                    >
                    <span className="truncate flex items-center gap-2">
                      <Filter
                        className="w-4 h-4 text-purple-400"
                        aria-hidden="true"
                      />
                      {sortBy === "popularity"
                        ? "Popular"
                        : sortBy === "rating"
                        ? "Top Rated"
                        : sortBy === "release"
                        ? "Release Date"
                        : sortBy === "name"
                        ? "Name (A-Z)"
                        : "Sort By"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 bg-gray-800 border-gray-700 rounded-lg shadow-lg"
                  align="start"
                  sideOffset={5}
                  aria-label="Sort options"
                >
                  {[
                    { value: "popularity", label: "Popular" },
                    { value: "rating", label: "Top Rated" },
                    { value: "release", label: "Release Date" },
                    { value: "name", label: "Name (A-Z)" },
                  ].map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={cn(
                        "cursor-pointer focus:bg-purple-500/30 focus:text-white transition-colors",
                        sortBy === option.value && "bg-purple-500/30 text-white"
                      )}
                      aria-selected={sortBy === option.value}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

                {/* Advanced Filters Dropdown */}
                <GamesFilterDropdown
                  platforms={platforms}
                  genres={genres}
                  selectedPlatform={selectedPlatform}
                  selectedGenre={selectedGenre}
                  selectedYear={selectedYear}
                  selectedTimeRange={timeRange}
                  selectedGameMode={selectedGameMode}
                  selectedTheme={selectedTheme}
                  minRating={minRating}
                  maxRating={maxRating}
                  hasMultiplayer={hasMultiplayer}
                  onPlatformChange={setSelectedPlatform}
                  onGenreChange={setSelectedGenre}
                  onYearChange={setSelectedYear}
                  onTimeRangeChange={setTimeRange}
                  onGameModeChange={setSelectedGameMode}
                  onThemeChange={setSelectedTheme}
                  onRatingRangeChange={setRatingRange}
                  onMultiplayerChange={setHasMultiplayer}
                />
              </div>
            </div>

            {/* Quick Filters Toggle & Clear */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeQuickFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearQuickFilters}
                  className="text-xs text-gray-400 hover:text-white h-8 px-2 sm:px-3"
                >
                  Clear ({activeQuickFiltersCount})
                </Button>
              )}
              
              <button
                onClick={() => setIsQuickFiltersExpanded(!isQuickFiltersExpanded)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-md"
              >
                <Filter className="w-4 h-4" />
                {isQuickFiltersExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Hide Quick Filters</span>
                    <span className="sm:hidden">Hide</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Quick Filters</span>
                    <span className="sm:hidden">Quick</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Filters - Collapsible */}
          <AnimatePresence>
            {isQuickFiltersExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 border-t border-gray-800/50 pt-3"
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
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                          minRating === rating * 10
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
                {genres.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-400 rounded-full" />
                        <span className="text-sm text-gray-300 font-medium">Genres:</span>
                      </div>
                      {genres.length > 5 && (
                        <span className="text-xs text-gray-500">+{genres.length - 5} more in advanced</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {genres.slice(0, 5).map((genre) => (
                        <button
                          key={genre.id}
                          onClick={() => setSelectedGenre(selectedGenre === genre.id ? "all" : genre.id)}
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

                {/* Platform & Release Period Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform Filter Chips */}
                  {platforms.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300 font-medium">Platforms:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {platforms.slice(0, 3).map((platform) => {
                          const shortName = platform.name
                            .replace('PlayStation', 'PS')
                            .replace('Nintendo', 'Nintendo')
                            .replace('Xbox', 'Xbox');
                          
                          return (
                            <button
                              key={platform.id}
                              onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? "all" : platform.id)}
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

                  {/* Release Period & Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300 font-medium">Release & Features:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["2024", "2023", "2020s"].map((year) => (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(selectedYear === year ? "all" : year)}
                          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                            selectedYear === year
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-green-300 border border-gray-700/30"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                      <button
                        onClick={() => setHasMultiplayer(!hasMultiplayer)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                          hasMultiplayer
                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-orange-300 border border-gray-700/30"
                        }`}
                      >
                        MP
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Filter Pills - Only for advanced filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1 sm:gap-2 overflow-x-auto scrollbar-hide mt-3">
            {getPlatformName() && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full text-xs"
              >
                {getPlatformName()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlatform("all")}
                  className="h-4 w-4 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label={`Remove ${getPlatformName()} filter`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {getGenreName() && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full text-xs"
              >
                {getGenreName()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGenre("all")}
                  className="h-4 w-4 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label={`Remove ${getGenreName()} filter`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {selectedYear !== "all" && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full text-xs"
              >
                {selectedYear}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedYear("all")}
                  className="h-4 w-4 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label={`Remove ${selectedYear} filter`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {timeRange !== "all" && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full"
              >
                {timeRange === "upcoming" ? "Upcoming" : 
                 timeRange === "recent" ? "Recent" :
                 timeRange === "this-year" ? "This Year" :
                 timeRange === "last-year" ? "Last Year" :
                 timeRange === "classic" ? "Classic" : timeRange}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRange("all")}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label="Remove time range filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {selectedGameMode !== "all" && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full"
              >
                Game Mode: {selectedGameMode}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGameMode("all")}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label="Remove game mode filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {selectedTheme !== "all" && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full"
              >
                Theme: {selectedTheme}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTheme("all")}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label="Remove theme filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {(minRating !== null || maxRating !== null) && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full"
              >
                Rating: {minRating}+ stars
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRatingRange(null, null)}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label="Remove rating filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {hasMultiplayer && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full"
              >
                Multiplayer Only
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHasMultiplayer(false)}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label="Remove multiplayer filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {searchQuery && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full max-w-[200px]"
              >
                <span className="truncate">"{searchQuery}"</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-700 ml-1 flex-shrink-0"
                  aria-label="Clear search query"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {/* Reset Filters Button - Only show when filters are active */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFiltersAndUrl}
                className="text-gray-300 hover:text-white hover:bg-gray-800/70 whitespace-nowrap rounded-full text-xs flex-shrink-0"
                aria-label="Reset all filters"
              >
                Reset all
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}