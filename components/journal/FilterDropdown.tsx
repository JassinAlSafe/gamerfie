"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, Check } from "lucide-react";
import type { JournalEntry } from "@/stores/useJournalStore";

interface FilterDropdownProps {
  criteria: {
    search: string;
    type: string;
    date: string;
  };
  onChange: (key: keyof FilterDropdownProps['criteria'], value: string) => void;
  entries: JournalEntry[];
}

export function FilterDropdown({
  criteria,
  onChange,
  entries,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  // Get unique dates from entries
  const uniqueDates = Array.from(
    new Set(entries.map((entry) => entry.date))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const hasActiveFilters = criteria.type || criteria.date;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`h-10 w-10 ${
            hasActiveFilters
              ? "bg-gray-800 border-gray-600"
              : "bg-gray-800/50 border-gray-700"
          }`}
          aria-label="Filter entries"
        >
          <SlidersHorizontal
            className={`h-4 w-4 ${
              hasActiveFilters ? "text-white" : "text-gray-400"
            }`}
          />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-none absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4 bg-gray-900 border-gray-800"
        align="end"
      >
        <div className="space-y-4">
          <h3 className="font-medium text-white">Filter Journal Entries</h3>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm text-gray-400">
              Entry Type
            </Label>
            <Select
              value={criteria.type}
              onValueChange={(value) => {
                onChange("type", value);
              }}
            >
              <SelectTrigger
                id="type"
                className="bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="progress">Progress Updates</SelectItem>
                <SelectItem value="daily">Daily Logs</SelectItem>
                <SelectItem value="review">Game Reviews</SelectItem>
                <SelectItem value="list">Custom Lists</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm text-gray-400">
              Date
            </Label>
            <Select
              value={criteria.date}
              onValueChange={(value) => {
                onChange("date", value);
              }}
            >
              <SelectTrigger
                id="date"
                className="bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 max-h-[200px]">
                <SelectItem value="">All dates</SelectItem>
                {uniqueDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {formatDate(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("type", "");
                onChange("date", "");
                setOpen(false);
              }}
              className="text-gray-400 hover:text-white"
            >
              Reset filters
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
