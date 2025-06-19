"use client";

import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useJournalStore } from "@/stores/useJournalStore";
import { NewEntryButton } from "./NewEntryButton";
// Dynamic import for the modal dialog
const JournalEntryDialog = lazy(() =>
  import("./JournalEntryDialog").then((module) => ({
    default: module.JournalEntryDialog,
  }))
);
import { FilterDropdown } from "./FilterDropdown";
import { TimelineView } from "./TimelineView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  Star,
  BarChart2,
  Search,
  X,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { JournalStats } from "./JournalStats";

export function JournalTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    search: "",
    type: "all",
    date: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { entries, loading, error, fetchEntries } = useJournalStore();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Debounce search to avoid excessive filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilterCriteria((prev) => ({ ...prev, search: searchQuery }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilterCriteria((prev) => ({ ...prev, search: "" }));
  };

  const handleFilterChange = (
    key: keyof typeof filterCriteria,
    value: string
  ) => {
    setFilterCriteria((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilterCriteria({ search: "", type: "all", date: "all" });
    setSearchQuery("");
  };

  const hasActiveFilters =
    filterCriteria.search || (filterCriteria.type && filterCriteria.type !== "all") || (filterCriteria.date && filterCriteria.date !== "all");

  const filteredEntries = useMemo(() => {
    if (!entries.length) return [];
    
    let filtered = entries;

    // Filter by tab first (most common filter)
    if (activeTab !== "all") {
      filtered = filtered.filter((entry) => entry.type === activeTab);
    }

    // Filter by type (from dropdown)
    if (filterCriteria.type && filterCriteria.type !== "all" && filterCriteria.type !== activeTab) {
      filtered = filtered.filter((entry) => entry.type === filterCriteria.type);
    }

    // Filter by date
    if (filterCriteria.date && filterCriteria.date !== "all") {
      filtered = filtered.filter((entry) => entry.date === filterCriteria.date);
    }

    // Filter by search (most expensive, do last)
    if (filterCriteria.search && filterCriteria.search.trim()) {
      const searchTerms = filterCriteria.search.toLowerCase().trim().split(' ');
      filtered = filtered.filter((entry) => {
        const searchableText = [
          entry.title,
          entry.content,
          entry.game?.name || ''
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    return filtered;
  }, [entries, filterCriteria, activeTab]);

  const entryCounts = useMemo(() => {
    if (!entries.length) {
      return { all: 0, progress: 0, review: 0, daily: 0, list: 0 };
    }
    
    // Single pass through entries for better performance
    const counts = entries.reduce(
      (acc, entry) => {
        acc.all++;
        if (entry.type in acc) {
          acc[entry.type as keyof typeof acc]++;
        }
        return acc;
      },
      { all: 0, progress: 0, review: 0, daily: 0, list: 0 }
    );
    
    return counts;
  }, [entries]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-gray-900/50 rounded-lg animate-pulse border border-gray-800">
              <div className="p-4 space-y-3">
                <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-3 w-3/4 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-gray-900 rounded animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-64 bg-gray-900 rounded animate-pulse"></div>
            <div className="h-9 w-20 bg-gray-900 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Tabs skeleton */}
        <div className="space-y-6">
          <div className="flex gap-1 bg-gray-900 p-1 rounded">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
          
          {/* Entries skeleton */}
          <div className="space-y-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-12 bg-gray-900/50 rounded-lg animate-pulse"></div>
                <div className="space-y-4">
                  {Array(2).fill(0).map((_, j) => (
                    <div key={j} className="h-32 bg-gray-900/30 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center bg-red-900/10 border border-red-800/30 rounded-xl"
      >
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-4 border border-red-500/20">
            <X className="w-12 h-12 text-red-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
        <p className="text-red-400 mb-6 max-w-md">{error}</p>
        <Button
          onClick={() => fetchEntries()}
          variant="outline"
          className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400 hover:text-red-300"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <JournalStats entries={entries} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <NewEntryButton onClick={() => setIsModalOpen(true)} />
          <Badge
            variant="outline"
            className="bg-gray-800/50 text-gray-300 border-gray-700"
          >
            {filteredEntries.length}{" "}
            {filteredEntries.length === 1 ? "entry" : "entries"}
          </Badge>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 w-full"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <FilterDropdown
            criteria={filterCriteria}
            onChange={handleFilterChange}
            entries={entries}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 py-2">
          <span className="text-sm text-gray-400">Active filters:</span>
          {filterCriteria.type && filterCriteria.type !== "all" && (
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              Type: {filterCriteria.type}
              <button
                onClick={() => handleFilterChange("type", "all")}
                className="ml-1 text-gray-400 hover:text-gray-200"
              >
                <X className="h-3 w-3 inline" />
              </button>
            </Badge>
          )}
          {filterCriteria.date && filterCriteria.date !== "all" && (
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              Date: {filterCriteria.date}
              <button
                onClick={() => handleFilterChange("date", "all")}
                className="ml-1 text-gray-400 hover:text-gray-200"
              >
                <X className="h-3 w-3 inline" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-white h-7 px-2"
          >
            Clear all
          </Button>
        </div>
      )}

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="bg-gray-900 border border-gray-800 p-1 grid grid-cols-2 sm:grid-cols-5 gap-1 h-auto">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white flex-col sm:flex-row h-auto py-2 px-3"
          >
            All
            <Badge
              variant="outline"
              className="ml-2 bg-gray-800/50 border-gray-700"
            >
              {entryCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white flex-col sm:flex-row h-auto py-2 px-3"
          >
            <BarChart2 className="h-4 w-4 mr-1" />
            Progress
            <Badge
              variant="outline"
              className="ml-2 bg-gray-800/50 border-gray-700"
            >
              {entryCounts.progress}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="review"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white flex-col sm:flex-row h-auto py-2 px-3"
          >
            <Star className="h-4 w-4 mr-1" />
            Reviews
            <Badge
              variant="outline"
              className="ml-2 bg-gray-800/50 border-gray-700"
            >
              {entryCounts.review}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="daily"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white flex-col sm:flex-row h-auto py-2 px-3"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Daily
            <Badge
              variant="outline"
              className="ml-2 bg-gray-800/50 border-gray-700"
            >
              {entryCounts.daily}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white flex-col sm:flex-row h-auto py-2 px-3 col-span-2 sm:col-span-1"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Lists
            <Badge
              variant="outline"
              className="ml-2 bg-gray-800/50 border-gray-700"
            >
              {entryCounts.list}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + filteredEntries.length}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filteredEntries.length > 0 ? (
                <TimelineView entries={filteredEntries} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center py-16 px-4 text-center"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-xl" />
                    <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-6 border border-purple-500/20 shadow-xl">
                      {activeTab === "progress" ? (
                        <BarChart2 className="h-12 w-12 text-emerald-400" />
                      ) : activeTab === "review" ? (
                        <Star className="h-12 w-12 text-amber-400" />
                      ) : activeTab === "daily" ? (
                        <Calendar className="h-12 w-12 text-blue-400" />
                      ) : activeTab === "list" ? (
                        <BookOpen className="h-12 w-12 text-purple-400" />
                      ) : (
                        <BookOpen className="h-12 w-12 text-purple-400" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {filterCriteria.search
                      ? "No Entries Match Your Search"
                      : activeTab === "all"
                      ? "No Journal Entries Yet"
                      : `No ${
                          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                        } Entries Yet`}
                  </h3>
                  <p className="text-gray-400 max-w-md mb-6">
                    {filterCriteria.search
                      ? "Try adjusting your search terms or filters to find what you're looking for."
                      : `Start documenting your gaming journey by creating your first ${
                          activeTab === "all" ? "" : activeTab + " "
                        }entry.`}
                  </p>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6"
                  >
                    {activeTab === "progress" ? (
                      <BarChart2 className="mr-2 h-4 w-4" />
                    ) : activeTab === "review" ? (
                      <Star className="mr-2 h-4 w-4" />
                    ) : activeTab === "daily" ? (
                      <Calendar className="mr-2 h-4 w-4" />
                    ) : activeTab === "list" ? (
                      <BookOpen className="mr-2 h-4 w-4" />
                    ) : (
                      <BookOpen className="mr-2 h-4 w-4" />
                    )}
                    Create Your First{" "}
                    {activeTab === "all"
                      ? ""
                      : `${
                          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                        } `}
                    Entry
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      <Suspense fallback={<div>Loading...</div>}>
        <JournalEntryDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialType={activeTab === "all" ? undefined : (activeTab as any)}
        />
      </Suspense>
    </div>
  );
}
