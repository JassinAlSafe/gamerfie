"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  Gamepad2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGamesStore } from "@/stores/useGamesStore";
import { GamesFilterDropdown } from "../filters/games-filter-dropdown";
import { cn } from "@/lib/utils";
import { useId } from "react";
import { Badge } from "@/components/ui/badge";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { useUrlParams } from "@/hooks/Settings/useUrlParams";

export function GamesHeader() {
  const searchInputId = useId();
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
    <div className="relative px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4">
      <div className="container mx-auto max-w-[2000px]">
        {/* Top Bar with gradient background */}
        <div className="relative rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-900/90 via-gray-900/95 to-gray-900/90 shadow-lg border border-gray-800/50 p-3 sm:p-4 mb-3 sm:mb-4">
          <div
            className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] rounded-xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
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

            {/* Search Input - Full width on mobile, auto on desktop */}
            <div className="relative w-full sm:w-auto sm:min-w-[280px] md:min-w-[300px] lg:min-w-[400px]">
              <label htmlFor={searchInputId} className="sr-only">
                Search games
              </label>
              <Input
                id={searchInputId}
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-gray-800/70 border-gray-700/50 focus:border-purple-500/50 transition-colors pl-10 pr-10 rounded-full h-10 placeholder:text-gray-500"
                aria-label="Search games"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-700/50 rounded-full"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex flex-wrap gap-3 items-center flex-1 min-w-0">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[140px] justify-between bg-gray-800/70 border-gray-700/50 hover:bg-gray-700/70 rounded-full"
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

            {/* Filters Dropdown */}
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
          
          {/* Active Filter Pills */}
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
            {getPlatformName() && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full"
              >
                {getPlatformName()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlatform("all")}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label={`Remove ${getPlatformName()} filter`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {getGenreName() && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full"
              >
                {getGenreName()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGenre("all")}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-700 ml-1"
                  aria-label={`Remove ${getGenreName()} filter`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {selectedYear !== "all" && (
              <Badge
                variant="outline"
                className="bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full"
              >
                {selectedYear}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedYear("all")}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-700 ml-1"
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
        </div>
      </div>
    </div>
  );
}