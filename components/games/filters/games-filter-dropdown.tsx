"use client";

import { Filter } from "lucide-react";
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
import { Platform, Genre } from "@/types/game";

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
  const years = Array.from(
    { length: 30 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] bg-gray-900 border-gray-800 justify-between"
        >
          Filters
          <Filter className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="bg-gray-900">
              <span>Platform</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <DropdownMenuItem
                  onClick={() => onPlatformChange("all")}
                  className={cn(
                    "cursor-pointer hover:bg-gray-800 focus:bg-gray-800",
                    selectedPlatform === "all" && "bg-purple-500/20"
                  )}
                >
                  All Platforms
                </DropdownMenuItem>
                {platforms?.map((platform) => (
                  <DropdownMenuItem
                    key={platform.id}
                    onClick={() => onPlatformChange(platform.id)}
                    className={cn(
                      "cursor-pointer hover:bg-gray-800 focus:bg-gray-800",
                      selectedPlatform === platform.id && "bg-purple-500/20"
                    )}
                  >
                    {platform.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-gray-800" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="bg-gray-900">
              <span>Genre</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <DropdownMenuItem
                  onClick={() => onGenreChange("all")}
                  className={cn(
                    "cursor-pointer hover:bg-gray-800 focus:bg-gray-800",
                    selectedGenre === "all" && "bg-purple-500/20"
                  )}
                >
                  All Genres
                </DropdownMenuItem>
                {genres?.map((genre) => (
                  <DropdownMenuItem
                    key={genre.id}
                    onClick={() => onGenreChange(genre.id)}
                    className={cn(
                      "cursor-pointer hover:bg-gray-800 focus:bg-gray-800",
                      selectedGenre === genre.id && "bg-purple-500/20"
                    )}
                  >
                    {genre.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-gray-800" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="bg-gray-900">
              <span>Release Year</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-900 border-gray-800 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <DropdownMenuItem
                  onClick={() => onYearChange("all")}
                  className={cn(
                    "cursor-pointer hover:bg-gray-800 focus:bg-gray-800",
                    selectedYear === "all" && "bg-purple-500/20"
                  )}
                >
                  All Years
                </DropdownMenuItem>
                {years.map((year) => (
                  <DropdownMenuItem
                    key={year}
                    onClick={() => onYearChange(year.toString())}
                    className={cn(
                      "cursor-pointer hover:bg-gray-800 focus:bg-gray-800",
                      selectedYear === year.toString() && "bg-purple-500/20"
                    )}
                  >
                    {year}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
