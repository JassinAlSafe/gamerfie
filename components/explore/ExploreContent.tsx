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
import { Separator } from "@/components/ui/separator";
import { Trophy, Flame, Star, Users2 } from "lucide-react";

import { GameShowcase } from "./GameShowcase/GameShowcase";
import type { ShowcaseGame } from "./GameShowcase/GameShowcase";

const BackToTopButton = dynamic(() => import("@/components/BackToTopButton"), {
  ssr: false,
  loading: () => null,
});

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  gradient: string;
}

function StatCard({
  icon,
  title,
  value,
  description,
  gradient,
}: StatCardProps) {
  return (
    <div
      className={`relative rounded-xl border border-white/5 p-6 overflow-hidden ${gradient}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" />
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 rounded-lg bg-white/10">{icon}</div>
          <div>
            <h3 className="text-sm font-medium text-white/60">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
        <p className="text-sm text-white/60">{description}</p>
      </div>
    </div>
  );
}

function CommunityStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Trophy className="w-5 h-5 text-amber-400" />}
        title="Total Games"
        value="2,547"
        description="Games in our database"
        gradient="bg-gradient-to-br from-amber-500/10 to-orange-500/10"
      />
      <StatCard
        icon={<Flame className="w-5 h-5 text-rose-400" />}
        title="Active Players"
        value="14.2K"
        description="Gamers playing right now"
        gradient="bg-gradient-to-br from-rose-500/10 to-pink-500/10"
      />
      <StatCard
        icon={<Star className="w-5 h-5 text-blue-400" />}
        title="Reviews"
        value="45.8K"
        description="Community reviews submitted"
        gradient="bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
      />
      <StatCard
        icon={<Users2 className="w-5 h-5 text-green-400" />}
        title="Community"
        value="28.9K"
        description="Active community members"
        gradient="bg-gradient-to-br from-green-500/10 to-emerald-500/10"
      />
    </div>
  );
}

export function ExploreContent() {
  const {
    searchQuery,
    handleSearchChange,
    handleKeyPress,
    searchButton,
    categoryButtons,
  } = useExplore();

  // Example showcase data - this would come from your admin CMS/database
  const showcaseData = {
    title: "State of Play February 2025 Games",
    description:
      "Every game featured in Sony's PlayStation State of Play on February 12, 2025.",
    date: "February 12, 2025",
    games: [
      {
        id: "1",
        title: "Saros",
        developer: "Housemarque",
        imageUrl: "/images/games/saros.jpg",
        releaseDate: "Q4 2025",
      },
      {
        id: "2",
        title: "Days Gone Remastered",
        developer: "Bend Studio",
        imageUrl: "/images/games/days-gone.jpg",
        releaseDate: "Summer 2025",
      },
      {
        id: "3",
        title: "Shinobi: Art of Vengeance",
        developer: "SEGA",
        imageUrl: "/images/games/shinobi.jpg",
        releaseDate: "Fall 2025",
      },
      {
        id: "4",
        title: "Warriors: Abyss",
        developer: "Omega Force",
        imageUrl: "/images/games/warriors.jpg",
        releaseDate: "2025",
      },
      {
        id: "5",
        title: "Borderlands 4",
        developer: "Gearbox",
        imageUrl: "/images/games/borderlands.jpg",
        releaseDate: "Holiday 2025",
      },
    ] as ShowcaseGame[],
  };

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

          <Separator className="my-12 bg-white/5" />

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

          <Separator className="my-12 bg-white/5" />

          {/* Community Stats Section */}
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Our Gaming Community
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Join thousands of gamers sharing their gaming experiences and
                discovering new adventures together
              </p>
            </div>
            <CommunityStats />
          </section>

          {/* Game Showcase Section */}
          <section>
            <GameShowcase {...showcaseData} />
          </section>
        </div>
      </TracingBeam>
      <BackToTopButton />
    </div>
  );
}
