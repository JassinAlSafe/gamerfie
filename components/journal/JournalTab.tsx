"use client";

import { useState, useEffect } from "react";
import { useJournalStore } from "@/stores/useJournalStore";
import { NewEntryButton } from "./NewEntryButton";
import { TimelineView } from "./TimelineView";
import { NewEntryModal } from "./NewEntryModal";
import { FilterDropdown } from "./FilterDropdown";
import { cn } from "@/lib/utils";

export function JournalTab() {
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    search: "",
    type: "all",
    date: "all",
  });
  const { entries, isLoading, error, fetchEntries } = useJournalStore();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filteredEntries = entries.filter((entry) => {
    const searchMatch =
      filter.search === "" ||
      Object.values(entry).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(filter.search.toLowerCase())
      );
    const typeMatch = filter.type === "all" || entry.type === filter.type;
    const dateMatch = filter.date === "all" || entry.date === filter.date;

    return searchMatch && typeMatch && dateMatch;
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-white mb-1">
            Gaming Journal
          </h1>
          <p className="text-sm text-gray-400">
            Document your gaming journey and track your progress
          </p>
        </div>
        <NewEntryButton onClick={() => setIsNewEntryModalOpen(true)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-900/20 rounded-lg border border-red-900">
          <p className="text-red-400">{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 px-4">
          <p className="text-lg text-gray-400 mb-6">
            Your gaming journal is empty. Start documenting your journey!
          </p>
          <NewEntryButton onClick={() => setIsNewEntryModalOpen(true)} />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <FilterDropdown
              filter={filter}
              setFilter={setFilter}
              entries={entries}
            />
          </div>
          <div
            className={cn(
              "transition-opacity duration-200",
              isLoading ? "opacity-50" : "opacity-100"
            )}
          >
            <TimelineView entries={filteredEntries} />
          </div>
        </>
      )}

      <NewEntryModal
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
      />
    </div>
  );
}
