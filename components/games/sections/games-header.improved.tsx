"use client";

import React, { memo, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Grid3X3, List, ChevronUp, ChevronDown } from "lucide-react";

import { useGamesStore } from "@/stores/useGamesStore";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { useUrlParams } from "@/hooks/Settings/useUrlParams";
import { GamesFilterDropdown } from "../filters/games-filter-dropdown";
import { GameSearchWithSuggestions } from "../GameSearchWithSuggestions";

import {
  STYLES,
  SORT_OPTIONS,
  VIEW_MODES,
  QUICK_FILTER_RATINGS,
  QUICK_FILTER_YEARS,
  QUICK_FILTER_SECTIONS,
  HEADER_NAV,
  SEARCH_CONFIG,
  ANIMATIONS,
  ACTIVE_FILTER_BADGE,
  DISPLAY_LIMITS
} from "@/config/games-header-config";

import {
  isFilterActive,
  countActiveQuickFilters,
  getSortDisplayLabel,
  shortenPlatformName,
  toggleRatingFilter,
  toggleGenreFilter,
  togglePlatformFilter,
  toggleYearFilter,
  clearQuickFilters,
  getActiveFilterBadges,
  formatGameCount,
  getQuickFilterButtonStyle,
  getSortIcon
} from "@/utils/games-header-utils";

import type {
  GamesHeaderProps,
  HeaderNavigationProps,
  SearchSectionProps,
  FiltersSectionProps,
  ActiveFiltersSectionProps,
  ViewModeToggleProps,
  SortDropdownProps,
  QuickFiltersProps,
  ActiveFilterBadgeProps,
  FilterState,
  FilterActions
} from "@/types/games-header.types";

// Header Navigation Section
const HeaderNavigation = memo(function HeaderNavigation({ totalGames }: HeaderNavigationProps) {
  return (
    <div className={STYLES.TOP_BAR.className}>
      <div className={STYLES.GRID_PATTERN.className} aria-hidden="true" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={HEADER_NAV.BACK_BUTTON.href}>
              <Button
                variant="ghost"
                size="icon"
                className={HEADER_NAV.BACK_BUTTON.className}
                aria-label={HEADER_NAV.BACK_BUTTON.label}
              >
                <HEADER_NAV.BACK_BUTTON.icon className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <HEADER_NAV.TITLE.icon
                  className="h-5 w-5 text-purple-400"
                  aria-hidden="true"
                />
                <h1 className={HEADER_NAV.TITLE.className}>
                  {HEADER_NAV.TITLE.text}
                </h1>
              </div>
              {totalGames > 0 && (
                <span className="text-sm text-gray-300">
                  {formatGameCount(totalGames)} titles available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Search Section
const SearchSection = memo(function SearchSection({
  searchQuery,
  onSearchChange,
  games,
  hasActiveFilters
}: SearchSectionProps) {
  const placeholder = hasActiveFilters 
    ? "Search filtered games..." 
    : SEARCH_CONFIG.placeholder;

  return (
    <GameSearchWithSuggestions
      value={searchQuery}
      onChange={onSearchChange}
      games={games}
      className={SEARCH_CONFIG.className}
      placeholder={placeholder}
    />
  );
});

// View Mode Toggle
const ViewModeToggle = memo(function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
  return (
    <div className={STYLES.VIEW_MODE_TOGGLE.container}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode(VIEW_MODES.GRID)}
        className={cn(
          STYLES.VIEW_MODE_TOGGLE.button,
          viewMode === VIEW_MODES.GRID
            ? STYLES.VIEW_MODE_TOGGLE.active
            : STYLES.VIEW_MODE_TOGGLE.inactive
        )}
        aria-label="Grid view"
        aria-pressed={viewMode === VIEW_MODES.GRID}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode(VIEW_MODES.LIST)}
        className={cn(
          STYLES.VIEW_MODE_TOGGLE.button,
          viewMode === VIEW_MODES.LIST
            ? STYLES.VIEW_MODE_TOGGLE.active
            : STYLES.VIEW_MODE_TOGGLE.inactive
        )}
        aria-label="List view"
        aria-pressed={viewMode === VIEW_MODES.LIST}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
});

// Sort Dropdown
const SortDropdown = memo(function SortDropdown({ sortBy, setSortBy }: SortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={STYLES.SORT_DROPDOWN.trigger}
          aria-label="Sort games"
        >
          <span className="truncate flex items-center gap-2">
            {React.createElement(getSortIcon(sortBy), { 
              className: "w-4 h-4 text-purple-400",
              "aria-hidden": "true"
            })}
            {getSortDisplayLabel(sortBy)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={STYLES.SORT_DROPDOWN.content}
        align="start"
        sideOffset={5}
        aria-label="Sort options"
      >
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={cn(
              STYLES.SORT_DROPDOWN.item.base,
              sortBy === option.value && STYLES.SORT_DROPDOWN.item.active
            )}
            aria-selected={sortBy === option.value}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

// Quick Filters Section
const QuickFilters = memo(function QuickFilters({
  filterState,
  filterActions,
  platforms,
  genres,
  activeQuickFiltersCount,
  onClearQuickFilters
}: QuickFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRatingClick = (rating: number) => {
    const result = toggleRatingFilter(filterState.minRating, rating);
    filterActions.setRatingRange(result.minRating, result.maxRating);
  };

  const handleGenreClick = (genreId: string) => {
    const newGenre = toggleGenreFilter(filterState.selectedGenre, genreId);
    filterActions.setSelectedGenre(newGenre);
  };

  const handlePlatformClick = (platformId: string) => {
    const newPlatform = togglePlatformFilter(filterState.selectedPlatform, platformId);
    filterActions.setSelectedPlatform(newPlatform);
  };

  const handleYearClick = (year: string) => {
    const newYear = toggleYearFilter(filterState.selectedYear, year);
    filterActions.setSelectedYear(newYear);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {activeQuickFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearQuickFilters}
          className="text-xs text-gray-400 hover:text-white h-8 px-2 sm:px-3"
        >
          Clear ({activeQuickFiltersCount})
        </Button>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-md"
      >
        <QUICK_FILTER_SECTIONS.RATING.icon className="w-4 h-4" />
        {isExpanded ? (
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

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            {...ANIMATIONS.QUICK_FILTERS}
            className="space-y-3 border-t border-gray-800/50 pt-3 w-full"
          >
            {/* Rating Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <QUICK_FILTER_SECTIONS.RATING.icon className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300 font-medium">
                  {QUICK_FILTER_SECTIONS.RATING.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_FILTER_RATINGS.map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all",
                      getQuickFilterButtonStyle(
                        filterState.minRating === rating * 10,
                        'rating'
                      )
                    )}
                  >
                    <QUICK_FILTER_SECTIONS.RATING.icon className="w-3 h-3 fill-current" />
                    <span>{rating}+</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filters */}
            {genres.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full" />
                    <span className="text-sm text-gray-300 font-medium">
                      {QUICK_FILTER_SECTIONS.GENRE.label}
                    </span>
                  </div>
                  {genres.length > DISPLAY_LIMITS.GENRES_QUICK && (
                    <span className="text-xs text-gray-500">
                      +{genres.length - DISPLAY_LIMITS.GENRES_QUICK} more in advanced
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {genres.slice(0, QUICK_FILTER_SECTIONS.GENRE.limit).map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreClick(genre.id)}
                      className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium transition-all",
                        getQuickFilterButtonStyle(
                          filterState.selectedGenre === genre.id,
                          'genre'
                        )
                      )}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Platform & Year Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <QUICK_FILTER_SECTIONS.PLATFORM.icon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300 font-medium">
                      {QUICK_FILTER_SECTIONS.PLATFORM.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {platforms.slice(0, QUICK_FILTER_SECTIONS.PLATFORM.limit).map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => handlePlatformClick(platform.id)}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium transition-all",
                          getQuickFilterButtonStyle(
                            filterState.selectedPlatform === platform.id,
                            'platform'
                          )
                        )}
                      >
                        {shortenPlatformName(platform.name)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <QUICK_FILTER_SECTIONS.YEAR.icon className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300 font-medium">
                    {QUICK_FILTER_SECTIONS.YEAR.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {QUICK_FILTER_YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearClick(year)}
                      className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium transition-all",
                        getQuickFilterButtonStyle(
                          filterState.selectedYear === year,
                          'year'
                        )
                      )}
                    >
                      {year}
                    </button>
                  ))}
                  <button
                    onClick={() => filterActions.setHasMultiplayer(!filterState.hasMultiplayer)}
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium transition-all",
                      getQuickFilterButtonStyle(
                        filterState.hasMultiplayer,
                        'multiplayer'
                      )
                    )}
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
  );
});

// Active Filter Badge
const ActiveFilterBadge = memo(function ActiveFilterBadge({
  type,
  label,
  onClear
}: ActiveFilterBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        ACTIVE_FILTER_BADGE.className,
        type === 'search' && "max-w-[200px]"
      )}
    >
      {type === 'search' ? (
        <span className="truncate">{label}</span>
      ) : (
        <span>{label}</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className={cn(
          ACTIVE_FILTER_BADGE.removeButton,
          "flex-shrink-0"
        )}
        aria-label={`Remove ${type} filter`}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
});

// Filters Section
const FiltersSection = memo(function FiltersSection(props: FiltersSectionProps) {
  const {
    platforms,
    genres,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    selectedPlatform,
    selectedGenre,
    selectedYear,
    timeRange,
    selectedGameMode,
    selectedTheme,
    minRating,
    maxRating,
    hasMultiplayer,
    setSelectedPlatform,
    setSelectedGenre,
    setSelectedYear,
    setTimeRange,
    setSelectedGameMode,
    setSelectedTheme,
    setRatingRange,
    setHasMultiplayer,
    activeQuickFiltersCount,
    onClearQuickFilters
  } = props;

  const filterState: FilterState = {
    selectedPlatform,
    selectedGenre,
    selectedCategory: 'all',
    selectedYear,
    timeRange,
    selectedGameMode,
    selectedTheme,
    minRating,
    maxRating,
    hasMultiplayer,
    sortBy,
    searchQuery: ''
  };

  const filterActions: FilterActions = {
    setSortBy,
    setSelectedPlatform,
    setSelectedGenre,
    setSelectedYear,
    setTimeRange,
    setSelectedGameMode,
    setSelectedTheme,
    setRatingRange,
    setHasMultiplayer,
    setSearchQuery: () => {}
  };

  return (
    <div className={STYLES.FILTERS_BAR.className}>
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
          
          <div className="flex items-center gap-2">
            <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
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

        <QuickFilters
          filterState={filterState}
          filterActions={filterActions}
          platforms={platforms}
          genres={genres}
          activeQuickFiltersCount={activeQuickFiltersCount}
          onClearQuickFilters={onClearQuickFilters}
        />
      </div>
    </div>
  );
});

// Active Filters Section
const ActiveFiltersSection = memo(function ActiveFiltersSection({
  filterState,
  filterActions,
  platforms,
  genres,
  hasActiveFilters,
  onResetFilters
}: ActiveFiltersSectionProps) {
  if (!hasActiveFilters) return null;

  const activeFilterBadges = getActiveFilterBadges(filterState, platforms, genres);

  return (
    <div className="flex flex-wrap gap-1 sm:gap-2 overflow-x-auto scrollbar-hide mt-3">
      {activeFilterBadges.map((badge, index) => (
        <ActiveFilterBadge
          key={`${badge.type}-${index}`}
          type={badge.type}
          label={badge.label}
          value={badge.value}
          onClear={() => {
            const updates = badge.clearAction();
            Object.entries(updates).forEach(([key, value]) => {
              const action = filterActions[key as keyof FilterActions];
              if (typeof action === 'function') {
                action(value as any);
              }
            });
          }}
        />
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onResetFilters}
        className="text-gray-300 hover:text-white hover:bg-gray-800/70 whitespace-nowrap rounded-full text-xs flex-shrink-0"
        aria-label="Reset all filters"
      >
        Reset all
      </Button>
    </div>
  );
});

// Main GamesHeader Component
export const GamesHeader = memo(function GamesHeader({ games = [] }: GamesHeaderProps) {
  const gamesStore = useGamesStore();
  const { resetFiltersAndUrl } = useUrlParams();
  const { viewMode, setViewMode } = useViewModeStore();

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

  const filterState = useMemo<FilterState>(() => ({
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
    sortBy,
    searchQuery
  }), [selectedPlatform, selectedGenre, selectedCategory, selectedYear, timeRange, selectedGameMode, selectedTheme, minRating, maxRating, hasMultiplayer, sortBy, searchQuery]);

  const filterActions = useMemo<FilterActions>(() => ({
    setSortBy,
    setSelectedPlatform,
    setSelectedGenre,
    setSelectedYear,
    setTimeRange,
    setSelectedGameMode,
    setSelectedTheme,
    setRatingRange,
    setHasMultiplayer,
    setSearchQuery
  }), [setSortBy, setSelectedPlatform, setSelectedGenre, setSelectedYear, setTimeRange, setSelectedGameMode, setSelectedTheme, setRatingRange, setHasMultiplayer, setSearchQuery]);

  const hasActiveFilters = useMemo(() => isFilterActive(filterState), [filterState]);
  const activeQuickFiltersCount = useMemo(() => countActiveQuickFilters(filterState), [filterState]);

  const handleClearQuickFilters = () => {
    const updates = clearQuickFilters();
    Object.entries(updates).forEach(([key, value]) => {
      const action = filterActions[key as keyof FilterActions];
      if (typeof action === 'function') {
        action(value as any);
      }
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className={STYLES.CONTAINER.className}>
      <div className={STYLES.INNER_CONTAINER.className}>
        <HeaderNavigation totalGames={totalGames} />
        
        <SearchSection
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          games={games}
          hasActiveFilters={hasActiveFilters}
        />

        <FiltersSection
          {...filterState}
          {...filterActions}
          platforms={platforms}
          genres={genres}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalGames={totalGames}
          isQuickFiltersExpanded={false}
          setIsQuickFiltersExpanded={() => {}}
          activeQuickFiltersCount={activeQuickFiltersCount}
          onClearQuickFilters={handleClearQuickFilters}
        />

        <ActiveFiltersSection
          filterState={filterState}
          filterActions={filterActions}
          platforms={platforms}
          genres={genres}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFiltersAndUrl}
        />
      </div>
    </div>
  );
});