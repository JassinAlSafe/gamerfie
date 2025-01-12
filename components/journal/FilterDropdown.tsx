"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JournalEntry } from "@/stores/useJournalStore";

interface FilterDropdownProps {
  filter: {
    search: string;
    type: string;
    date: string;
  };
  setFilter: (filter: any) => void;
  entries: JournalEntry[];
}

export function FilterDropdown({
  filter,
  setFilter,
  entries,
}: FilterDropdownProps) {
  const entryTypes = [
    { value: "progress", label: "Progress Updates" },
    { value: "daily", label: "Daily Logs" },
    { value: "review", label: "Game Reviews" },
    { value: "list", label: "Custom Lists" },
  ];

  const uniqueDates = [...new Set(entries.map((entry) => entry.date))]
    .sort()
    .reverse();

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      <Input
        type="text"
        placeholder="Search entries..."
        value={filter.search}
        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        className="w-full md:w-[300px] bg-transparent border-gray-800 text-white placeholder:text-gray-500 h-9 px-3 text-sm"
      />

      <Select
        value={filter.type}
        onValueChange={(value) => setFilter({ ...filter, type: value })}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-transparent border-gray-800 text-white h-9 px-3 text-sm">
          <SelectValue placeholder="All entry types" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-800">
          <SelectItem value="all" className="text-white text-sm">
            All entry types
          </SelectItem>
          {entryTypes.map((type) => (
            <SelectItem
              key={type.value}
              value={type.value}
              className="text-white text-sm"
            >
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filter.date}
        onValueChange={(value) => setFilter({ ...filter, date: value })}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-transparent border-gray-800 text-white h-9 px-3 text-sm">
          <SelectValue placeholder="All dates" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-800">
          <SelectItem value="all" className="text-white text-sm">
            All dates
          </SelectItem>
          {uniqueDates.map((date) => (
            <SelectItem key={date} value={date} className="text-white text-sm">
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
