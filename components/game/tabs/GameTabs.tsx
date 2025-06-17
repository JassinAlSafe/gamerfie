"use client";

import React, { memo, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Game } from "@/types";
import { Profile } from "@/types/profile";
import { OverviewTab } from "./OverviewTab";

// Lazy load heavy tab components
const MediaTab = React.lazy(() => import("./MediaTab").then(module => ({ default: module.MediaTab })));
const AchievementsTab = React.lazy(() => import("./AchievementsTab").then(module => ({ default: module.AchievementsTab })));
const ActivityTab = React.lazy(() => import("./ActivityTab").then(module => ({ default: module.ActivityTab })));
const RelatedTab = React.lazy(() => import("./RelatedTab").then(module => ({ default: module.RelatedTab })));

interface GameTabsProps {
  game: Game;
  profile: Profile | null;
  activeTab: string;
  onTabChange: (value: string) => void;
  progress: {
    playTime: number | null;
    completionPercentage: number | null;
    achievementsCompleted: number | null;
    loading: boolean;
    playTimeHistory: Array<{ date: string; hours: number }>;
    achievementHistory: Array<{ date: string; count: number }>;
  };
  activities: {
    data: any[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
  };
}

// Loading fallback component
function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  );
}

export const GameTabs = memo(function GameTabs({
  game,
  profile: _profile,
  activeTab,
  onTabChange,
  progress: _progress,
  activities,
}: GameTabsProps) {
  return (
    <div className="bg-gray-950/80 backdrop-blur-md border-t border-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <div className="relative">
            {/* Improved tab list alignment and spacing */}
            <TabsList className="flex w-full max-w-3xl mx-auto justify-center border-b border-gray-800/50 bg-transparent h-auto py-0">
              <TabsTrigger
                value="overview"
                className="flex-1 py-4 font-medium data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="flex-1 py-4 font-medium data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none"
              >
                Media
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="flex-1 py-4 font-medium data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none"
              >
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="related"
                className="flex-1 py-4 font-medium data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none"
              >
                Related
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex-1 py-4 font-medium data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none"
              >
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Gradient indicators for horizontal scrolling */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-950/80 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-950/80 to-transparent pointer-events-none" />
          </div>

          {/* Tab content with consistent padding */}
          <div className="py-8">
            <TabsContent
              value="overview"
              className="focus-visible:outline-none"
            >
              <OverviewTab
                game={game}
                onViewMoreRelated={() => onTabChange("related")}
              />
            </TabsContent>

            <TabsContent value="media" className="focus-visible:outline-none">
              <Suspense fallback={<TabLoadingFallback />}>
                <MediaTab game={game} />
              </Suspense>
            </TabsContent>

            <TabsContent
              value="achievements"
              className="focus-visible:outline-none"
            >
              <Suspense fallback={<TabLoadingFallback />}>
                <AchievementsTab game={game} profile={_profile} />
              </Suspense>
            </TabsContent>

            <TabsContent value="related" className="focus-visible:outline-none">
              <Suspense fallback={<TabLoadingFallback />}>
                <RelatedTab games={[]} />
              </Suspense>
            </TabsContent>

            <TabsContent
              value="activity"
              className="focus-visible:outline-none"
            >
              <Suspense fallback={<TabLoadingFallback />}>
                <ActivityTab gameId={game.id} activities={activities} />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
});
