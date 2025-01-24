"use client";

import React, { useCallback, useMemo, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import PopularGamesSection from "@/components/PopularGamesSection";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Calendar, Flame } from "lucide-react";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useGamesStore } from "@/stores/useGamesStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { useSearchStore } from "@/stores/useSearchStore";
import { GAME_CATEGORIES, type GameCategory } from "@/types/index";
import { useGames } from "@/hooks/useGames";

// Dynamically import heavy components
const BackToTopButton = dynamic(() => import("@/components/BackToTopButton"), {
  ssr: false,
  loading: () => null,
});

const categories = [
  {
    id: "popular",
    label: "Popular Games",
    icon: Flame,
    color: "text-orange-500",
  },
  {
    id: "upcoming",
    label: "Upcoming Games",
    icon: Calendar,
    color: "text-purple-500",
  },
  {
    id: "recent",
    label: "New Releases",
    icon: Sparkles,
    color: "text-yellow-500",
  },
] as const;

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
      <p className="text-red-400">Something went wrong:</p>
      <pre className="text-sm text-red-300">{error.message}</pre>
      <Button onClick={resetErrorBoundary} className="mt-4">
        Try again
      </Button>
    </div>
  );
}

// Loading skeleton for hero section
function HeroSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="h-12 bg-gray-800/50 rounded w-3/4 max-w-2xl" />
        <div className="h-6 bg-gray-800/50 rounded w-1/2" />
      </div>
      <div className="flex gap-4 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-800/50 rounded-full w-32" />
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for game categories
function GameCategoriesSkeleton() {
  return (
    <div className="space-y-24">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-6">
          <div className="h-8 bg-gray-800/50 rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-gray-800/50" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface HeroSectionProps {
  searchQuery: string;
  handleSearchChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (_e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchButton: React.ReactNode;
  categoryButtons: React.ReactNode;
}

// Hero section component
function HeroSection({
  searchQuery,
  handleSearchChange,
  handleKeyPress,
  searchButton,
  categoryButtons,
}: HeroSectionProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-8">
          Discover Your Next Gaming Adventure
        </h1>

        <TextGenerateEffect
          words="Explore trending games, connect with fellow gamers, and keep track of your gaming journey."
          className="text-gray-300 text-xl"
        />

        <div className="relative max-w-2xl mx-auto space-y-8">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-white/70 transition-colors duration-200"
              size={24}
            />
            <Input
              type="text"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-400 pl-14 pr-24 py-7 rounded-full 
                       focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 text-xl
                       hover:bg-white/10 transition-all duration-200 shadow-lg"
            />
            {searchButton}
          </div>

          <div className="pt-2">{categoryButtons}</div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ExplorePage() {
  const router = useRouter();
  const setSelectedCategory = useGamesStore(
    (state) => state.setSelectedCategory
  );
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    executeSearch,
  } = useSearchStore();

  const { prefetchPopularCategories } = useGames({
    category: "all",
    limit: 10,
  });

  // Prefetch popular categories on page load
  useEffect(() => {
    prefetchPopularCategories();
  }, [prefetchPopularCategories]);

  const debouncedSearch = useDebounce(searchQuery);

  const handleSearch = useCallback(() => {
    if (debouncedSearch.trim()) {
      executeSearch(debouncedSearch);
    }
  }, [debouncedSearch, executeSearch]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleCategoryClick = useCallback(
    (category: GameCategory) => {
      setSelectedCategory(category);
      // Map category to appropriate timeRange
      const timeRangeMap: Record<GameCategory, string> = {
        upcoming: "upcoming",
        recent: "new_releases",
        popular: "all",
        all: "all",
        classic: "classic",
        indie: "indie",
        anticipated: "anticipated",
      };
      const timeRange = timeRangeMap[category];
      router.push(`/all-games?category=${category}&timeRange=${timeRange}`);
    },
    [router, setSelectedCategory]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const searchButton = useMemo(() => {
    if (!searchQuery) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
        >
          <Button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500/80 hover:bg-purple-500 text-white 
                     transition-all duration-200 rounded-xl px-4 py-2 text-sm font-medium
                     shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }, [searchQuery, handleSearch]);

  const categoryButtons = useMemo(
    () => (
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {categories.map(({ id, label, icon: Icon, color }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            className={`bg-white/5 hover:bg-white/10 text-gray-300 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105`}
            onClick={() => handleCategoryClick(id as GameCategory)}
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <span>{label}</span>
          </Button>
        ))}
      </div>
    ),
    [handleCategoryClick]
  );

  const gameCategories = useMemo(
    () => (
      <div className="space-y-12">
        {categories.map(({ id }) => (
          <ErrorBoundary
            key={id}
            FallbackComponent={ErrorFallback}
            onReset={() => {
              // Reset the error boundary state
            }}
          >
            <Suspense
              fallback={
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] rounded-lg bg-gray-800/50 animate-pulse"
                    />
                  ))}
                </div>
              }
            >
              <PopularGamesSection category={id === "recent" ? "new" : id} />
            </Suspense>
          </ErrorBoundary>
        ))}
      </div>
    ),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
            handleKeyPress={handleKeyPress}
            searchButton={searchButton}
            categoryButtons={categoryButtons}
          />
        </Suspense>
        <Suspense fallback={<GameCategoriesSkeleton />}>
          {gameCategories}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
