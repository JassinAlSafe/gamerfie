"use client";

import React, { useCallback, useMemo } from "react";
import PopularGamesSection from "@/components/PopularGamesSection";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Calendar, Flame } from "lucide-react";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useGamesStore } from '@/stores/useGamesStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "react-error-boundary";

const categories = [
  { id: 'popular', label: 'Popular Games', icon: Flame, color: 'text-orange-500' },
  { id: 'upcoming', label: 'Upcoming Games', icon: Calendar, color: 'text-purple-500' },
  { id: 'recent', label: 'New Releases', icon: Sparkles, color: 'text-yellow-500' }
] as const;

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
      <p className="text-red-400">Something went wrong:</p>
      <pre className="text-sm text-red-300">{error.message}</pre>
      <Button onClick={resetErrorBoundary} className="mt-4">Try again</Button>
    </div>
  );
}

export default function ExplorePage() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, setSelectedCategory } = useGamesStore();
  const debouncedSearch = useDebounce(searchQuery);

  const handleSearch = useCallback(() => {
    if (debouncedSearch.trim()) {
      setSelectedCategory('all');
      router.push(`/all-games?search=${encodeURIComponent(debouncedSearch)}`);
    }
  }, [debouncedSearch, router, setSelectedCategory]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
    router.push(`/all-games?category=${category}`);
  }, [router, setSelectedCategory]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

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

  const categoryButtons = useMemo(() => (
    <div className="mt-4 flex flex-wrap gap-2 justify-center">
      {categories.map(({ id, label }) => (
        <Button 
          key={id}
          variant="ghost" 
          size="sm" 
          className="bg-white/5 hover:bg-white/10 text-gray-300"
          onClick={() => handleCategoryClick(id)}
        >
          {label}
        </Button>
      ))}
    </div>
  ), [handleCategoryClick]);

  const gameCategories = useMemo(() => (
    <div className="space-y-24">
      {categories.map(({ id, label, icon: Icon, color }) => (
        <ErrorBoundary 
          key={id}
          FallbackComponent={ErrorFallback}
          onReset={() => {
            // Reset the error boundary state
          }}
        >
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Icon className={`h-6 w-6 ${color}`} />
                <h2 className="text-2xl font-bold text-white">{label}</h2>
              </div>
              <Button 
                variant="ghost" 
                className="text-purple-400 hover:text-purple-300"
                onClick={() => handleCategoryClick(id)}
              >
                View All
              </Button>
            </div>
            <React.Suspense fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
                ))}
              </div>
            }>
              <PopularGamesSection category={id === 'recent' ? 'new' : id} />
            </React.Suspense>
          </div>
        </ErrorBoundary>
      ))}
    </div>
  ), [handleCategoryClick]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pt-28">
      <TracingBeam className="px-4">
        <div className="relative z-10 max-w-7xl mx-auto space-y-24">
          {/* Hero Section */}
          <div className="relative flex flex-col items-center justify-center min-h-[40vh] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-6">
                Discover Your Next Gaming Adventure
              </h1>
              <TextGenerateEffect
                words="Explore trending games, connect with fellow gamers, and keep track of your gaming journey."
                className="text-gray-400 text-lg mb-8"
              />
              <div className="relative max-w-xl mx-auto">
                <div className="relative group">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-white/70 transition-colors duration-200"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="Search for games..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-400 pl-12 pr-24 py-6 rounded-2xl 
                             focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 text-lg
                             hover:bg-white/10 transition-all duration-200"
                  />
                  {searchButton}
                </div>
                {categoryButtons}
              </div>
            </motion.div>
          </div>

          {/* Game Categories */}
          {gameCategories}
        </div>
      </TracingBeam>
    </div>
  );
}
