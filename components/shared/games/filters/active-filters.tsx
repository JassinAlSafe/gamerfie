"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameFilters } from "@/types/game";

interface ActiveFiltersProps {
  filters: GameFilters;
  onRemoveFilter: (key: keyof GameFilters, value: string) => void;
  onResetFilters: () => void;
}

export function ActiveFilters({
  filters = {
    status: "all",
    platform: "all",
    genre: "all",
    category: "all",
    sort: "popularity",
    search: "",
  },
  onRemoveFilter,
  onResetFilters,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    (filters?.status && filters.status !== "all") ||
    (filters?.platform && filters.platform !== "all") ||
    (filters?.genre && filters.genre !== "all") ||
    (filters?.category && filters.category !== "all") ||
    (filters?.sort && filters.sort !== "popularity") ||
    (filters?.search && filters.search !== "");

  if (!hasActiveFilters) return null;

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === "sort") return value !== "popularity";
    if (key === "search") return value !== "";
    return value !== "all";
  });

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {activeFilters.map(([key, value]) => (
        <Badge
          key={`${key}-${value}`}
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1"
        >
          <span className="capitalize">
            {key === "search" ? `"${value}"` : value}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter(key as keyof GameFilters, value)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="text-gray-400 hover:text-white"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
