"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { ErrorBoundary } from "react-error-boundary";
import { useExplore } from "@/hooks/useExplore";
import { GAME_CATEGORIES } from "@/config/categories";
import { PopularGamesSection } from "../games/sections/popular-games-section";
import HeroSection from "./HeroSection/HeroSection";
import {
  HeroSkeleton,
  GameCategoriesSkeleton,
} from "./GameCategoriesSkeleton/GameCategoriesSkeleton";
import { ErrorFallback } from "../games/ui/error-display";

const BackToTopButton = dynamic(() => import("@/components/BackToTopButton"), {
  ssr: false,
  loading: () => null,
});

export function ExploreContent() {
  const {
    searchQuery,
    handleSearchChange,
    handleKeyPress,
    searchButton,
    categoryButtons,
  } = useExplore();

  return (
    <div className="relative z-10 pt-28 pb-24">
      <TracingBeam className="px-4">
        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
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
            <div className="space-y-12">
              {GAME_CATEGORIES.map(({ id }) => (
                <ErrorBoundary
                  key={id}
                  FallbackComponent={ErrorFallback}
                  onReset={() => {
                    // Reset error state
                  }}
                >
                  <PopularGamesSection category={id} />
                </ErrorBoundary>
              ))}
            </div>
          </Suspense>
        </div>
      </TracingBeam>
      <BackToTopButton />
    </div>
  );
}
