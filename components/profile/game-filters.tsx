"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GameFilters {
  status: string;
  sortBy: string;
  sortOrder: string;
  view: "grid" | "list";
}

interface GameFiltersProps {
  onFilterChange: (filters: GameFilters) => void;
}

export function GameFilters({ onFilterChange }: GameFiltersProps) {
  const [filters, setFilters] = useState<GameFilters>({
    status: "all",
    sortBy: "recent",
    sortOrder: "desc",
    view: "list",
  });

  const updateFilters = (update: Partial<GameFilters>) => {
    const newFilters = { ...filters, ...update };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const selectTriggerClass =
    "bg-gray-900/90 border-gray-800 hover:bg-gray-900 hover:border-gray-700 focus:ring-gray-700";
  const selectContentClass =
    "bg-gray-900/95 border border-gray-800 text-gray-100";
  const selectItemClass =
    "text-gray-100 focus:bg-gray-800 focus:text-white cursor-pointer";

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 bg-gray-900/40 rounded-lg">
      {/* Mobile View Toggle */}
      <div className="flex sm:hidden justify-end">
        <div className="flex gap-2 bg-gray-900/60 rounded-md p-1">
          <Button
            variant={filters.view === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => updateFilters({ view: "grid" })}
            className={
              filters.view === "grid"
                ? "bg-gray-800 hover:bg-gray-700"
                : "hover:bg-gray-800/60"
            }
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={filters.view === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => updateFilters({ view: "list" })}
            className={
              filters.view === "list"
                ? "bg-gray-800 hover:bg-gray-700"
                : "hover:bg-gray-800/60"
            }
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Filters Group */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex gap-3 sm:gap-4 w-full sm:w-auto">
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilters({ status: value })}
          >
            <SelectTrigger
              className={`w-full sm:w-[180px] ${selectTriggerClass}`}
            >
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className={selectContentClass} position="popper">
              <SelectItem value="all" className={selectItemClass}>
                All Games
              </SelectItem>
              <SelectItem value="playing" className={selectItemClass}>
                Playing
              </SelectItem>
              <SelectItem value="completed" className={selectItemClass}>
                Completed
              </SelectItem>
              <SelectItem value="want_to_play" className={selectItemClass}>
                Want to Play
              </SelectItem>
              <SelectItem value="dropped" className={selectItemClass}>
                Dropped
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilters({ sortBy: value })}
          >
            <SelectTrigger
              className={`w-full sm:w-[180px] ${selectTriggerClass}`}
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className={selectContentClass} position="popper">
              <SelectItem value="recent" className={selectItemClass}>
                Recently Added
              </SelectItem>
              <SelectItem value="name" className={selectItemClass}>
                Name
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortOrder}
            onValueChange={(value) => updateFilters({ sortOrder: value })}
          >
            <SelectTrigger
              className={`w-full sm:w-[180px] ${selectTriggerClass}`}
            >
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent className={selectContentClass} position="popper">
              <SelectItem value="asc" className={selectItemClass}>
                Ascending
              </SelectItem>
              <SelectItem value="desc" className={selectItemClass}>
                Descending
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop View Toggle - Hidden on Mobile */}
        <div className="hidden sm:flex gap-2 bg-gray-900/60 rounded-md p-1 flex-shrink-0">
          <Button
            variant={filters.view === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => updateFilters({ view: "grid" })}
            className={
              filters.view === "grid"
                ? "bg-gray-800 hover:bg-gray-700"
                : "hover:bg-gray-800/60"
            }
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={filters.view === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => updateFilters({ view: "list" })}
            className={
              filters.view === "list"
                ? "bg-gray-800 hover:bg-gray-700"
                : "hover:bg-gray-800/60"
            }
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
