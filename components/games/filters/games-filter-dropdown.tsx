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
  onPlatformChange: (platform: string) => void;
  onGenreChange: (genre: string) => void;
  onYearChange: (year: string) => void;
}

export function GamesFilterDropdown({
  platforms,
  genres,
  selectedPlatform,
  selectedGenre,
  selectedYear,
  onPlatformChange,
  onGenreChange,
  onYearChange,
}: GamesFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filterButtonId = useId();
  const platformSubId = useId();
  const genreSubId = useId();
  const yearSubId = useId();

  // Memoize the years array
  const years = useMemo(
    () => Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i),
    []
  );

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedPlatform !== "all") count++;
    if (selectedGenre !== "all") count++;
    if (selectedYear !== "all") count++;
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
