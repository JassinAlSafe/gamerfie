"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameFilters } from "@/types";

interface ActiveFiltersProps {
  filters: GameFilters;
  onRemoveFilter: (key: keyof GameFilters, value: string) => void;
  onResetFilters: () => void;
}

/**
 * Type guard to check if a value is a non-empty array
 */
const isNonEmptyArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.length > 0;
};

/**
 * Type guard to check if a value is a non-empty string
 */
// const isNonEmptyString = (value: unknown): value is string => {
//   return typeof value === "string" && value.trim() !== "";
// };

/**
 * Type guard to check if a value is a valid number range
 */
const isValidRange = (value: unknown): value is [number, number] => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
};

export function ActiveFilters({
  filters = {},
  onRemoveFilter,
  onResetFilters,
}: ActiveFiltersProps) {
  // Safely check for active filters with proper type validation
  const hasActiveFilters = Boolean(
    isNonEmptyArray(filters.platforms) ||
      isNonEmptyArray(filters.genres) ||
      isNonEmptyArray(filters.developers) ||
      isNonEmptyArray(filters.publishers) ||
      isNonEmptyArray(filters.status) ||
      isNonEmptyArray(filters.tags) ||
      isNonEmptyArray(filters.esrb_rating) ||
      isValidRange(filters.year_range) ||
      isValidRange(filters.rating_range) ||
      isValidRange(filters.metacritic_range) ||
      typeof filters.has_achievements === "boolean" ||
      typeof filters.has_multiplayer === "boolean" ||
      typeof filters.is_free === "boolean"
  );

  if (!hasActiveFilters) return null;

  // Build active filters list with proper type checking
  const activeFilters: Array<{
    key: keyof GameFilters;
    value: string;
    label: string;
  }> = [];

  // Handle array filters
  if (isNonEmptyArray(filters.platforms)) {
    filters.platforms.forEach((platform) => {
      activeFilters.push({
        key: "platforms",
        value: platform,
        label: platform,
      });
    });
  }

  if (isNonEmptyArray(filters.genres)) {
    filters.genres.forEach((genre) => {
      activeFilters.push({ key: "genres", value: genre, label: genre });
    });
  }

  if (isNonEmptyArray(filters.developers)) {
    filters.developers.forEach((developer) => {
      activeFilters.push({
        key: "developers",
        value: developer,
        label: developer,
      });
    });
  }

  if (isNonEmptyArray(filters.publishers)) {
    filters.publishers.forEach((publisher) => {
      activeFilters.push({
        key: "publishers",
        value: publisher,
        label: publisher,
      });
    });
  }

  if (isNonEmptyArray(filters.status)) {
    filters.status.forEach((status) => {
      const statusLabels: Record<string, string> = {
        want_to_play: "Want to Play",
        playing: "Playing",
        completed: "Completed",
        on_hold: "On Hold",
        dropped: "Dropped",
      };
      activeFilters.push({
        key: "status",
        value: status,
        label: statusLabels[status] || status,
      });
    });
  }

  if (isNonEmptyArray(filters.tags)) {
    filters.tags.forEach((tag) => {
      activeFilters.push({ key: "tags", value: tag, label: tag });
    });
  }

  if (isNonEmptyArray(filters.esrb_rating)) {
    filters.esrb_rating.forEach((rating) => {
      activeFilters.push({
        key: "esrb_rating",
        value: rating,
        label: `ESRB: ${rating}`,
      });
    });
  }

  // Handle range filters
  if (isValidRange(filters.year_range)) {
    const [start, end] = filters.year_range;
    activeFilters.push({
      key: "year_range",
      value: `${start}-${end}`,
      label: `Year: ${start}-${end}`,
    });
  }

  if (isValidRange(filters.rating_range)) {
    const [min, max] = filters.rating_range;
    activeFilters.push({
      key: "rating_range",
      value: `${min}-${max}`,
      label: `Rating: ${min}-${max}`,
    });
  }

  if (isValidRange(filters.metacritic_range)) {
    const [min, max] = filters.metacritic_range;
    activeFilters.push({
      key: "metacritic_range",
      value: `${min}-${max}`,
      label: `Metacritic: ${min}-${max}`,
    });
  }

  // Handle boolean filters
  if (filters.has_achievements === true) {
    activeFilters.push({
      key: "has_achievements",
      value: "true",
      label: "Has Achievements",
    });
  }

  if (filters.has_multiplayer === true) {
    activeFilters.push({
      key: "has_multiplayer",
      value: "true",
      label: "Multiplayer",
    });
  }

  if (filters.is_free === true) {
    activeFilters.push({
      key: "is_free",
      value: "true",
      label: "Free to Play",
    });
  }

  /**
   * Handle filter removal with proper error handling
   */
  const handleRemoveFilter = (key: keyof GameFilters, value: string) => {
    try {
      onRemoveFilter(key, value);
    } catch (error) {
      console.error("Error removing filter:", error);
    }
  };

  /**
   * Handle filter reset with proper error handling
   */
  const handleResetFilters = () => {
    try {
      onResetFilters();
    } catch (error) {
      console.error("Error resetting filters:", error);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {activeFilters.map(({ key, value, label }, index) => (
        <Badge
          key={`${key}-${value}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1"
        >
          <span className="capitalize">{label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleRemoveFilter(key, value)}
            aria-label={`Remove ${label} filter`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetFilters}
          className="text-gray-400 hover:text-white"
          aria-label="Clear all filters"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
