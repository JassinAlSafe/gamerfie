"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect, memo } from "react";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { ErrorBoundary } from "react-error-boundary";
import { useExploreOptimized } from "@/hooks/useExploreOptimized";
// GAME_CATEGORIES removed - using CATEGORY_CONFIGS instead
import { GameSection } from "../shared/GameSection/GameSection";
import HeroSection from "./HeroSection/HeroSection";
import {
  HeroSkeleton,
  GameCategoriesSkeleton,
} from "./GameCategoriesSkeleton/GameCategoriesSkeleton";
import { ErrorFallback } from "../games/ui/error-display";
import { Separator } from "@/components/ui/separator";
import { Trophy, Flame, Star, Users2, TrendingUp, CalendarDays, Zap } from "lucide-react";

import { GameShowcase } from "./GameShowcase/GameShowcase";
import { PlaylistService } from "@/services/playlistService";
import { Playlist } from "@/types/playlist";

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

const StatCard = memo(({
  icon,
  title,
  value,
  description,
  gradient,
}: StatCardProps) => {
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
});

StatCard.displayName = "StatCard";

const CommunityStats = memo(() => {
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
});

CommunityStats.displayName = "CommunityStats";

// Optimized category configuration
const CATEGORY_CONFIGS = [
  { 
    source: "trending" as const, 
    title: "Trending Now", 
    icon: TrendingUp, 
    iconColor: "text-green-500" 
  },
  { 
    source: "popular" as const, 
    title: "Popular Games", 
    icon: Flame, 
    iconColor: "text-orange-500" 
  },
  { 
    source: "upcoming" as const, 
    title: "Coming Soon", 
    icon: CalendarDays, 
    iconColor: "text-purple-500" 
  },
  { 
    source: "recent" as const, 
    title: "Recently Released", 
    icon: Zap, 
    iconColor: "text-blue-500" 
  },
] as const;

const PlaylistSection = memo(({ playlists, isLoading }: { 
  playlists: Playlist[]; 
  isLoading: boolean; 
}) => (
  <section className="space-y-8">
    <div className="text-center space-y-4">
      <h2 className="text-3xl font-bold text-white">
        Featured Collections
      </h2>
      <p className="text-white/60 max-w-2xl mx-auto">
        Discover curated collections of games handpicked by our
        community
      </p>
    </div>
    {isLoading ? (
      <div className="text-center py-12">
        <div className="text-white/60">Loading playlists...</div>
      </div>
    ) : (
      <div className="space-y-8">
        {playlists.map((playlist) => (
          <GameShowcase
            key={playlist.id}
            playlistId={playlist.id}
            title={playlist.title}
            description={playlist.description}
            date={new Date(playlist.createdAt).toLocaleDateString()}
            type={playlist.type}
          />
        ))}
        {playlists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No playlists available.</p>
          </div>
        )}
      </div>
    )}
  </section>
));

PlaylistSection.displayName = "PlaylistSection";

export const ExploreContent = memo(() => {
  const {
    searchQuery,
    handleSearchChange,
    handleKeyPress,
    searchButton,
    categoryButtons,
  } = useExploreOptimized();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const fetchedPlaylists = await PlaylistService.getPlaylists();
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlaylists();
  }, []);

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
              {CATEGORY_CONFIGS.map(({ source, title, icon, iconColor }) => (
                <ErrorBoundary
                  key={source}
                  FallbackComponent={ErrorFallback}
                  onReset={() => {
                    // Reset error state
                  }}
                >
                  <GameSection
                    source={source}
                    title={title}
                    icon={icon}
                    iconColor={iconColor}
                    limit={12}
                    animated
                    priority={source === "trending"}
                  />
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
          <PlaylistSection playlists={playlists} isLoading={isLoading} />
        </div>
      </TracingBeam>
      <BackToTopButton />
    </div>
  );
});

ExploreContent.displayName = "ExploreContent";
