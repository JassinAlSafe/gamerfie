"use client";

import { useMemo, useState, useId } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Platform {
  id: string | number;
  name: string;
  slug?: string;
}

interface Genre {
  id: string | number;
  name: string;
  slug?: string;
}

interface GamesFilterDropdownProps {
  platforms: Platform[];
  genres: Genre[];
  selectedPlatform: string;
  selectedGenre: string;
  selectedYear: string;
  selectedTimeRange: import("@/types").TimeRange;
  selectedGameMode?: string;
  selectedTheme?: string;
  minRating?: number | null;
  maxRating?: number | null;
  hasMultiplayer?: boolean;
  onPlatformChange: (platform: string) => void;
  onGenreChange: (genre: string) => void;
  onYearChange: (year: string) => void;
  onTimeRangeChange: (timeRange: import("@/types").TimeRange) => void;
  onGameModeChange?: (gameMode: string) => void;
  onThemeChange?: (theme: string) => void;
  onRatingRangeChange?: (min: number | null, max: number | null) => void;
  onMultiplayerChange?: (hasMultiplayer: boolean) => void;
}

export function GamesFilterDropdown({
  platforms,
  genres,
  selectedPlatform,
  selectedGenre,
  selectedYear,
  selectedTimeRange,
  selectedGameMode = 'all',
  selectedTheme = 'all',
  minRating,
  maxRating,
  hasMultiplayer = false,
  onPlatformChange,
  onGenreChange,
  onYearChange,
  onTimeRangeChange,
  onGameModeChange,
  onThemeChange,
  onRatingRangeChange,
  onMultiplayerChange,
}: GamesFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filterButtonId = useId();
  const platformSubId = useId();
  const genreSubId = useId();
  const yearSubId = useId();
  const timeRangeSubId = useId();
  const gameModeSubId = useId();
  const themeSubId = useId();
  const ratingSubId = useId();

  // Memoize the years array
  const years = useMemo(
    () => Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i),
    []
  );

  // Time range options
  const timeRangeOptions = useMemo(() => [
    { value: "all", label: "All Time" },
    { value: "upcoming", label: "Upcoming" },
    { value: "recent", label: "Recent" },
    { value: "this-year", label: "This Year" },
    { value: "last-year", label: "Last Year" },
  ], []);

  // Game mode options
  const gameModeOptions = useMemo(() => [
    { value: "all", label: "All Modes" },
    { value: "single-player", label: "Single Player" },
    { value: "multiplayer", label: "Multiplayer" },
    { value: "co-op", label: "Co-op" },
    { value: "split-screen", label: "Split Screen" },
    { value: "mmo", label: "MMO" },
    { value: "battle-royale", label: "Battle Royale" },
  ], []);

  // Theme options
  const themeOptions = useMemo(() => [
    { value: "all", label: "All Themes" },
    { value: "action", label: "Action" },
    { value: "fantasy", label: "Fantasy" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "horror", label: "Horror" },
    { value: "thriller", label: "Thriller" },
    { value: "survival", label: "Survival" },
    { value: "historical", label: "Historical" },
    { value: "stealth", label: "Stealth" },
    { value: "comedy", label: "Comedy" },
    { value: "mystery", label: "Mystery" },
    { value: "romance", label: "Romance" },
    { value: "war", label: "War" },
    { value: "kids", label: "Kids" },
  ], []);

  // Rating options
  const ratingOptions = useMemo(() => [
    { min: null, max: null, label: "Any Rating" },
    { min: 9, max: null, label: "9+ Stars" },
    { min: 8, max: null, label: "8+ Stars" },
    { min: 7, max: null, label: "7+ Stars" },
    { min: 6, max: null, label: "6+ Stars" },
    { min: 5, max: null, label: "5+ Stars" },
  ], []);

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedPlatform !== "all") count++;
    if (selectedGenre !== "all") count++;
    if (selectedYear !== "all") count++;
    if (selectedTimeRange !== "all") count++;
    if (selectedGameMode !== "all") count++;
    if (selectedTheme !== "all") count++;
    if (minRating !== null || maxRating !== null) count++;
    if (hasMultiplayer) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Memoize the platform items
  const platformItems = useMemo(
    () => (
      <>
        <DropdownMenuItem
          onClick={() => {
            onPlatformChange("all");
            setIsOpen(false);
          }}
          className={cn(
            "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
            selectedPlatform === "all" && "bg-purple-500/30 text-white"
          )}
          aria-selected={selectedPlatform === "all"}
        >
          All Platforms
        </DropdownMenuItem>
        {platforms?.map((platform) => (
          <DropdownMenuItem
            key={platform.id}
            onClick={() => {
              onPlatformChange(platform.id.toString());
              setIsOpen(false);
            }}
            className={cn(
              "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
              selectedPlatform === platform.id.toString() &&
                "bg-purple-500/30 text-white"
            )}
            aria-selected={selectedPlatform === platform.id.toString()}
          >
            {platform.name}
          </DropdownMenuItem>
        ))}
      </>
    ),
    [platforms, selectedPlatform, onPlatformChange]
  );

  // Memoize the genre items
  const genreItems = useMemo(
    () => (
      <>
        <DropdownMenuItem
          onClick={() => {
            onGenreChange("all");
            setIsOpen(false);
          }}
          className={cn(
            "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
            selectedGenre === "all" && "bg-purple-500/30 text-white"
          )}
          aria-selected={selectedGenre === "all"}
        >
          All Genres
        </DropdownMenuItem>
        {genres?.map((genre) => (
          <DropdownMenuItem
            key={genre.id}
            onClick={() => {
              onGenreChange(genre.id.toString());
              setIsOpen(false);
            }}
            className={cn(
              "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
              selectedGenre === genre.id.toString() &&
                "bg-purple-500/30 text-white"
            )}
            aria-selected={selectedGenre === genre.id.toString()}
          >
            {genre.name}
          </DropdownMenuItem>
        ))}
      </>
    ),
    [genres, selectedGenre, onGenreChange]
  );

  // Memoize the year items
  const yearItems = useMemo(
    () => (
      <>
        <DropdownMenuItem
          onClick={() => {
            onYearChange("all");
            setIsOpen(false);
          }}
          className={cn(
            "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
            selectedYear === "all" && "bg-purple-500/30 text-white"
          )}
          aria-selected={selectedYear === "all"}
        >
          All Years
        </DropdownMenuItem>
        {years.map((year) => (
          <DropdownMenuItem
            key={year}
            onClick={() => {
              onYearChange(year.toString());
              setIsOpen(false);
            }}
            className={cn(
              "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
              selectedYear === year.toString() && "bg-purple-500/30 text-white"
            )}
            aria-selected={selectedYear === year.toString()}
          >
            {year}
          </DropdownMenuItem>
        ))}
      </>
    ),
    [years, selectedYear, onYearChange]
  );

  // Memoize the time range items
  const timeRangeItems = useMemo(
    () => (
      <>
        {timeRangeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              onTimeRangeChange(option.value as import("@/types").TimeRange);
              setIsOpen(false);
            }}
            className={cn(
              "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
              selectedTimeRange === option.value && "bg-purple-500/30 text-white"
            )}
            aria-selected={selectedTimeRange === option.value}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </>
    ),
    [timeRangeOptions, selectedTimeRange, onTimeRangeChange]
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          id={filterButtonId}
          variant="outline"
          className="bg-gray-800/70 border-gray-700/50 hover:bg-gray-700/70 focus:ring-2 focus:ring-purple-500/50 rounded-full relative"
          aria-label="Filter games"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal
              className="h-4 w-4 text-purple-400"
              aria-hidden="true"
            />
            <span>Filters</span>
          </span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-gray-900 border-gray-800 rounded-lg shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
        align="start"
        sideOffset={5}
        aria-labelledby={filterButtonId}
      >
        <div className="p-2 border-b border-gray-800">
          <h3 className="text-sm font-medium text-gray-300">Filter Games</h3>
        </div>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors"
              id={platformSubId}
              aria-haspopup="menu"
              aria-expanded={false}
            >
              <span className="flex items-center justify-between w-full">
                <span>Platform</span>
                {selectedPlatform !== "all" && (
                  <span className="text-xs bg-purple-500/30 text-white px-1.5 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-lg shadow-lg"
                aria-labelledby={platformSubId}
              >
                {platformItems}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-gray-800" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors"
              id={genreSubId}
              aria-haspopup="menu"
              aria-expanded={false}
            >
              <span className="flex items-center justify-between w-full">
                <span>Genre</span>
                {selectedGenre !== "all" && (
                  <span className="text-xs bg-purple-500/30 text-white px-1.5 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-lg shadow-lg"
                aria-labelledby={genreSubId}
              >
                {genreItems}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-gray-800" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors"
              id={yearSubId}
              aria-haspopup="menu"
              aria-expanded={false}
            >
              <span className="flex items-center justify-between w-full">
                <span>Release Year</span>
                {selectedYear !== "all" && (
                  <span className="text-xs bg-purple-500/30 text-white px-1.5 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-lg shadow-lg"
                aria-labelledby={yearSubId}
              >
                {yearItems}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-gray-800" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors"
              id={timeRangeSubId}
              aria-haspopup="menu"
              aria-expanded={false}
            >
              <span className="flex items-center justify-between w-full">
                <span>Time Range</span>
                {selectedTimeRange !== "all" && (
                  <span className="text-xs bg-purple-500/30 text-white px-1.5 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-lg shadow-lg"
                aria-labelledby={timeRangeSubId}
              >
                {timeRangeItems}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Advanced Filters */}
          {(onGameModeChange || onThemeChange || onRatingRangeChange || onMultiplayerChange) && (
            <>
              <DropdownMenuSeparator className="bg-gray-800" />

              {/* Game Mode Filter */}
              {onGameModeChange && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    className="bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors"
                    id={gameModeSubId}
                    aria-haspopup="menu"
                    aria-expanded={false}
                  >
                    <span className="flex items-center justify-between w-full">
                      <span>Game Mode</span>
                      {selectedGameMode !== "all" && (
                        <span className="text-xs bg-purple-500/30 text-white px-1.5 py-0.5 rounded-full">
                          1
                        </span>
                      )}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent
                      className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-lg shadow-lg"
                      aria-labelledby={gameModeSubId}
                    >
                      {gameModeOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => {
                            onGameModeChange(option.value);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
                            selectedGameMode === option.value && "bg-purple-500/30 text-white"
                          )}
                          aria-selected={selectedGameMode === option.value}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}

              {/* Theme Filter */}
              {onThemeChange && (
                <>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      className="bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors"
                      id={themeSubId}
                      aria-haspopup="menu"
                      aria-expanded={false}
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>Theme</span>
                        {selectedTheme !== "all" && (
                          <span className="text-xs bg-purple-500/30 text-white px-1.5 py-0.5 rounded-full">
                            1
                          </span>
                        )}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent
                        className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-lg shadow-lg"
                        aria-labelledby={themeSubId}
                      >
                        {themeOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => {
                              onThemeChange(option.value);
                              setIsOpen(false);
                            }}
                            className={cn(
                              "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
                              selectedTheme === option.value && "bg-purple-500/30 text-white"
                            )}
                            aria-selected={selectedTheme === option.value}
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </>
              )}

              {/* Rating Filter */}
              {onRatingRangeChange && (
                <>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      className="bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors"
                      id={ratingSubId}
                      aria-haspopup="menu"
                      aria-expanded={false}
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>Rating</span>
                        {(minRating !== null || maxRating !== null) && (
                          <span className="text-xs bg-purple-500/30 text-white px-1.5 py-0.5 rounded-full">
                            1
                          </span>
                        )}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent
                        className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-lg shadow-lg"
                        aria-labelledby={ratingSubId}
                      >
                        {ratingOptions.map((option, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => {
                              onRatingRangeChange(option.min, option.max);
                              setIsOpen(false);
                            }}
                            className={cn(
                              "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
                              (minRating === option.min && maxRating === option.max) && "bg-purple-500/30 text-white"
                            )}
                            aria-selected={minRating === option.min && maxRating === option.max}
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </>
              )}

              {/* Multiplayer Filter */}
              {onMultiplayerChange && (
                <>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={() => {
                      onMultiplayerChange(!hasMultiplayer);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white transition-colors",
                      hasMultiplayer && "bg-purple-500/30 text-white"
                    )}
                    aria-selected={hasMultiplayer}
                  >
                    <span className="flex items-center justify-between w-full">
                      <span>Multiplayer Only</span>
                      {hasMultiplayer && (
                        <span className="text-xs bg-purple-500/30 text-white px-1.5 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
