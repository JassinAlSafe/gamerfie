"use client";

import { useState, useMemo, useCallback } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useUserGames, useGamesList } from "@/hooks/useGames";
import { useGameMutations } from "@/hooks/useGameMutations";
import { GamesList } from "./games/GamesList";
import { GamesFilter } from "./games/GamesFilter";
import { GamesPagination } from "./games/GamesPagination";
import { LoadingSkeleton } from "./games/LoadingSkeleton";
import { ErrorCard } from "./games/ErrorCard";
import { NoGamesFound } from "./games/NoGamesFound";

const GAMES_PER_PAGE = 12;

interface GameTabProps {
  initialPage?: number;
}

// Custom error fallback with logging
const ErrorFallback = ({ error }: FallbackProps) => {
  console.error("Games Tab Error:", error);
  return <ErrorCard error={error} />;
};

export function GamesTab({ initialPage = 1 }: GameTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "playing" | "completed" | "dropped">("all");
  const [currentPage, setCurrentPage] = useState(initialPage);

  const { data, isLoading, error } = useUserGames(GAMES_PER_PAGE);
  const mutations = useGameMutations();

  // Memoized games data
  const allGames = useMemo(() => 
    data?.pages.flatMap(page => page.userGames) || [],
    [data]
  );

  const { filteredGames, totalPages } = useGamesList(
    { userGames: allGames, reviews: data?.pages[0]?.reviews || [] },
    searchQuery,
    statusFilter,
    currentPage
  );

  // Memoized pagination component
  const PaginationComponent = useMemo(() => 
    totalPages > 1 ? (
      <GamesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    ) : null,
    [currentPage, totalPages]
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorCard error={error} />;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="space-y-6">
        <GamesFilter
          searchQuery={searchQuery}
          setSearchQuery={handleSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        {filteredGames.length === 0 ? (
          <NoGamesFound searchQuery={searchQuery} statusFilter={statusFilter} />
        ) : (
          <>
            <GamesList 
              games={filteredGames} 
              mutations={mutations}
            />
            {PaginationComponent}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
