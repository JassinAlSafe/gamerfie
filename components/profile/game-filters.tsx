import { useState } from "react";
import { Filter, SortAsc, SortDesc } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { GameStatus } from "@/types/game";

interface GameFiltersProps {
  onFilterChange: (filters: GameFilters) => void;
}

export interface GameFilters {
  status: GameStatus | "all";
  sortBy: "recent" | "name" | "rating";
  sortOrder: "asc" | "desc";
}

export function GameFilters({ onFilterChange }: GameFiltersProps) {
  const [filters, setFilters] = useState<GameFilters>({
    status: "all",
    sortBy: "recent",
    sortOrder: "desc",
  });

  const handleFilterChange = (key: keyof GameFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const statusOptions = [
    { value: "all", label: "All Games" },
    { value: "playing", label: "Currently Playing" },
    { value: "completed", label: "Completed" },
    { value: "want_to_play", label: "Want to Play" },
    { value: "dropped", label: "Dropped" },
  ];

  const sortOptions = [
    { value: "recent", label: "Recently Added" },
    { value: "name", label: "Game Name" },
    { value: "rating", label: "Rating" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange("status", value)}
      >
        <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-700/50 text-white">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900/95 border-gray-700/50 text-white">
          {statusOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-white hover:bg-white/10 cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-gray-900/50 border-gray-700/50 text-white"
          >
            <Filter className="mr-2 h-4 w-4" />
            Sort & Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900/95 border-gray-700/50 text-white">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700/50" />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={`flex items-center cursor-pointer hover:bg-white/10 ${
                filters.sortBy === option.value
                  ? "text-purple-400"
                  : "text-white"
              }`}
              onClick={() => handleFilterChange("sortBy", option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-gray-700/50" />
          <DropdownMenuItem
            className="flex items-center cursor-pointer hover:bg-white/10"
            onClick={() =>
              handleFilterChange(
                "sortOrder",
                filters.sortOrder === "asc" ? "desc" : "asc"
              )
            }
          >
            {filters.sortOrder === "asc" ? (
              <SortAsc className="mr-2 h-4 w-4" />
            ) : (
              <SortDesc className="mr-2 h-4 w-4" />
            )}
            {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
