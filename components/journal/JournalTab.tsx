"use client";

import { useState, useEffect, useMemo } from "react";
import { useJournalStore } from "@/stores/useJournalStore";
import { NewEntryButton } from "./NewEntryButton";
import { JournalEntryDialog } from "./JournalEntryDialog";
import { FilterDropdown } from "./FilterDropdown";
import { TimelineView } from "./TimelineView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  BookOpen,
  Calendar,
  Star,
  BarChart2,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import { JournalStats } from "./JournalStats";

export function JournalTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    search: "",
    type: "",
    date: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { entries, loading, error, fetchEntries } = useJournalStore();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilterCriteria((prev) => ({ ...prev, search: value }));
      }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
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
    setFilterCriteria({ search: "", type: "", date: "" });
    setSearchQuery("");
  };

  const hasActiveFilters =
    filterCriteria.search || filterCriteria.type || filterCriteria.date;

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Filter by search
    if (filterCriteria.search) {
      const searchLower = filterCriteria.search.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower) ||
          entry.game?.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (filterCriteria.type) {
      filtered = filtered.filter((entry) => entry.type === filterCriteria.type);
    }

    // Filter by date
    if (filterCriteria.date) {
      filtered = filtered.filter((entry) => entry.date === filterCriteria.date);
    }

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((entry) => entry.type === activeTab);
    }

    return filtered;
  }, [entries, filterCriteria, activeTab]);

  const entryCounts = useMemo(() => {
    const counts = {
      all: entries.length,
      progress: entries.filter((e) => e.type === "progress").length,
      review: entries.filter((e) => e.type === "review").length,
      daily: entries.filter((e) => e.type === "daily").length,
      list: entries.filter((e) => e.type === "list").length,
    };
    return counts;
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error: {error}</p>
        <Button
          onClick={() => fetchEntries()}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <JournalStats entries={entries} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

        <div className="w-full sm:w-auto flex items-center gap-2">
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
          {filterCriteria.type && (
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              Type: {filterCriteria.type}
              <button
                onClick={() => handleFilterChange("type", "")}
                className="ml-1 text-gray-400 hover:text-gray-200"
              >
                <X className="h-3 w-3 inline" />
              </button>
            </Badge>
          )}
          {filterCriteria.date && (
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              Date: {filterCriteria.date}
              <button
                onClick={() => handleFilterChange("date", "")}
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
        <TabsList className="bg-gray-900 border border-gray-800 p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
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
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
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
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
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
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
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
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
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

      <JournalEntryDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={activeTab === "all" ? undefined : (activeTab as any)}
      />
    </div>
  );
}
