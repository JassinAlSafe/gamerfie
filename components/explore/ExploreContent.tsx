"use client";

import dynamic from "next/dynamic";
import { Suspense, memo } from "react";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { ErrorBoundary } from "react-error-boundary";
import { useExploreOptimized } from "@/hooks/useExploreOptimized";
import { useExploreData } from "@/hooks/useExploreData";
import { OptimizedGameSection } from "../shared/GameSection/OptimizedGameSection";
import HeroSection from "./HeroSection/HeroSection";
import {
  HeroSkeleton,
  GameCategoriesSkeleton,
} from "./GameCategoriesSkeleton/GameCategoriesSkeleton";
import { ErrorFallback } from "../games/ui/error-display";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  CalendarDays,
  Zap,
  Flame,
  Users2,
  Trophy,
} from "lucide-react";
import { GameShowcase } from "./GameShowcase/GameShowcase";
import { Playlist } from "@/types/playlist";

const BackToTopButton = dynamic(() => import("@/components/BackToTopButton"), {
  ssr: false,
  loading: () => null,
});

// Optimized category configuration
const CATEGORY_CONFIGS = [
  {
    key: "trending" as const,
    title: "Trending Now",
    icon: TrendingUp,
    iconColor: "text-green-500",
  },
  {
    key: "popular" as const,
    title: "Popular Games",
    icon: Flame,
    iconColor: "text-orange-500",
  },
  {
    key: "upcoming" as const,
    title: "Coming Soon",
    icon: CalendarDays,
    iconColor: "text-purple-500",
  },
  {
    key: "recent" as const,
    title: "Recently Released",
    icon: Zap,
    iconColor: "text-blue-500",
  },
] as const;

// Community stats component
const CommunityStats = memo(() => {
  const stats = [
    {
      icon: <Users2 className="w-8 h-8" />,
      title: "Active Gamers",
      value: "15,000+",
      description: "Passionate players worldwide",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Games Tracked",
      value: "500K+",
      description: "Comprehensive game database",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Flame className="w-8 h-8" />,
      title: "Reviews",
      value: "1M+",
      description: "Community-driven insights",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 group hover:bg-white/10 transition-all duration-300"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
          />
          <div className="relative z-10">
            <div
              className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white mb-4`}
            >
              {stat.icon}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-lg font-semibold text-white/90">
                {stat.title}
              </p>
              <p className="text-sm text-white/60">{stat.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

CommunityStats.displayName = "CommunityStats";

// Featured playlists section
const PlaylistSection = memo(
  ({ playlists, isLoading }: { playlists: Playlist[]; isLoading: boolean }) => {
    if (isLoading) {
      return (
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">
              Featured Collections
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Discover curated collections of games handpicked by our community
            </p>
          </div>
          <div className="text-center py-12">
            <div className="text-white/60">Loading playlists...</div>
          </div>
        </section>
      );
    }

    // Filter out playlists with no games
    const playlistsWithGames = playlists.filter(
      (playlist) => playlist.games && playlist.games.length > 0
    );

    if (playlistsWithGames.length === 0) {
      return null; // Don't render section if no valid playlists
    }

    return (
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Featured Collections
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Discover curated collections of games handpicked by our community
          </p>
        </div>
        <div className="space-y-8">
          {playlistsWithGames.map((playlist) => (
            <GameShowcase
              key={playlist.id}
              playlistId={playlist.id}
              title={playlist.title}
              description={playlist.description}
              date={new Date(playlist.createdAt).toLocaleDateString()}
              type={playlist.type}
              games={playlist.games}
            />
          ))}
        </div>
      </section>
    );
  }
);

PlaylistSection.displayName = "PlaylistSection";

export const ExploreContent = memo(() => {
  const {
    searchQuery,
    handleSearchChange,
    handleKeyPress,
    searchButton,
    categoryButtons,
  } = useExploreOptimized();

  const { data: exploreData, isLoading, error } = useExploreData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <TracingBeam className="px-6">
        <div className="max-w-7xl mx-auto space-y-16 py-8">
          {/* Hero Section */}
          <Suspense fallback={<HeroSkeleton />}>
            <HeroSection
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              handleKeyPress={handleKeyPress}
              searchButton={searchButton}
              categoryButtons={categoryButtons}
            />
          </Suspense>

          <Separator className="bg-white/10" />

          {/* Game Categories */}
          <Suspense fallback={<GameCategoriesSkeleton />}>
            <div className="space-y-12">
              {CATEGORY_CONFIGS.map(({ key, title, icon, iconColor }) => (
                <ErrorBoundary
                  key={key}
                  FallbackComponent={ErrorFallback}
                  onReset={() => {
                    // Reset error state
                  }}
                >
                  <OptimizedGameSection
                    title={title}
                    games={exploreData?.[key] || []}
                    icon={icon}
                    iconColor={iconColor}
                    animated
                    priority={key === "trending"}
                    isLoading={isLoading}
                    error={error}
                  />
                </ErrorBoundary>
              ))}
            </div>
          </Suspense>

          <Separator className="bg-white/10" />

          {/* Community Stats */}
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

          {/* Featured Playlists */}
          <PlaylistSection
            playlists={exploreData?.featuredPlaylists || []}
            isLoading={isLoading}
          />
        </div>
      </TracingBeam>
      <BackToTopButton />
    </div>
  );
});

ExploreContent.displayName = "ExploreContent";
