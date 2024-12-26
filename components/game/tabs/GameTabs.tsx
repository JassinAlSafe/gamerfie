"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Game } from "@/types/game";
import { Profile } from "@/types/profile";
import { OverviewTab } from "./OverviewTab";
import { StatsTab } from "./StatsTab";
import { MediaTab } from "./MediaTab";
import { AchievementsTab } from "./AchievementsTab";
import { ChallengesTab } from "./ChallengesTab";
import { ActivityTab } from "./ActivityTab";
import { RelatedTab } from "./RelatedTab";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "stats", label: "Stats" },
  { id: "media", label: "Media" },
  { id: "achievements", label: "Achievements" },
  { id: "challenges", label: "Challenges" },
  { id: "activity", label: "Activity" },
  { id: "related", label: "Related" },
] as const;

export function GameTabs({
  game,
  profile,
  activeTab,
  onTabChange,
  progress,
  activities,
}: GameTabsProps) {
  return (
    <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <div className="relative">
            <TabsList className="w-full justify-start border-b border-white/10 bg-transparent h-auto p-0 overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-hide">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "px-6 py-3 text-gray-400 data-[state=active]:text-white rounded-none bg-transparent transition-all duration-200 ease-in-out capitalize hover:text-white/80",
                    "relative",
                    "focus:outline-none focus:ring-0 focus:ring-offset-0"
                  )}
                >
                  {tab.label}
                  {tab.id === activeTab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-950/80 pointer-events-none" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-8"
            >
              <div className="max-w-7xl mx-auto">
                <TabsContent
                  value="overview"
                  className="mt-0 focus:outline-none"
                >
                  <OverviewTab game={game} />
                </TabsContent>

                <TabsContent value="stats" className="mt-0 focus:outline-none">
                  <StatsTab game={game} profile={profile} progress={progress} />
                </TabsContent>

                <TabsContent value="media" className="mt-0 focus:outline-none">
                  <MediaTab game={game} />
                </TabsContent>

                <TabsContent
                  value="achievements"
                  className="mt-0 focus:outline-none"
                >
                  <AchievementsTab game={game} profile={profile} />
                </TabsContent>

                <TabsContent
                  value="challenges"
                  className="mt-0 focus:outline-none"
                >
                  <ChallengesTab game={game} profile={profile} />
                </TabsContent>

                <TabsContent
                  value="activity"
                  className="mt-0 focus:outline-none"
                >
                  <ActivityTab
                    gameId={game.id.toString()}
                    activities={activities}
                  />
                </TabsContent>

                <TabsContent
                  value="related"
                  className="mt-0 focus:outline-none"
                >
                  <RelatedTab games={game.relatedGames || []} />
                </TabsContent>
              </div>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
