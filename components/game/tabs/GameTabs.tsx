"use client";

import React, { memo, Suspense, useState, useEffect, useMemo, useRef } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { Profile } from "@/types/profile";
import { OverviewTab } from "./OverviewTab";
import { 
  Activity,
  Camera,
  Trophy,
  Gamepad2,
  Menu,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load heavy tab components with proper error boundaries
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

// Enhanced tab configuration with icons and metadata
const TAB_CONFIG = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Gamepad2,
    description: 'Game details and summary',
    priority: 'high' as const,
  },
  {
    id: 'media',
    label: 'Media',
    icon: Camera,
    description: 'Screenshots and videos',
    priority: 'high' as const,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    description: 'Game achievements',
    priority: 'medium' as const,
  },
  {
    id: 'related',
    label: 'Related',
    icon: Gamepad2,
    description: 'Similar games',
    priority: 'low' as const,
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    description: 'Recent activities',
    priority: 'low' as const,
  },
];

// Enhanced loading fallback with skeleton UI
function TabLoadingFallback({ tabId }: { tabId?: string }) {
  const getSkeletonContent = () => {
    switch (tabId) {
      case 'media':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-gray-800/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        );
      case 'achievements':
        return (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800/50 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800/50 rounded animate-pulse" />
                  <div className="h-3 bg-gray-800/30 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        );
      case 'related':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-gray-800/50 rounded-lg animate-pulse" />
                <div className="h-4 bg-gray-800/50 rounded animate-pulse" />
                <div className="h-3 bg-gray-800/30 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-800/20 rounded-lg">
                <div className="w-10 h-10 bg-gray-800/50 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800/50 rounded animate-pulse" />
                  <div className="h-3 bg-gray-800/30 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
              <p className="text-gray-400">Loading content...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {getSkeletonContent()}
    </div>
  );
}

// Mobile tab selector component
function MobileTabSelector({ 
  activeTab, 
  onTabChange,
  availableTabs 
}: { 
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableTabs: typeof TAB_CONFIG;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeTabConfig = availableTabs.find(tab => tab.id === activeTab);

  return (
    <div className="relative md:hidden">
      <Button
        variant="outline"
        className="w-full justify-between bg-gray-800/50 border-gray-700 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {activeTabConfig?.icon && <activeTabConfig.icon className="w-4 h-4" />}
          <span>{activeTabConfig?.label}</span>
        </div>
        <Menu className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl z-50"
          >
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                  "hover:bg-gray-800/50 first:rounded-t-lg last:rounded-b-lg",
                  activeTab === tab.id ? "bg-purple-600/20 text-purple-400" : "text-gray-300"
                )}
                onClick={() => {
                  onTabChange(tab.id);
                  setIsOpen(false);
                }}
              >
                <tab.icon className="w-4 h-4" />
                <div>
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Enhanced desktop tab navigation with scrolling
function DesktopTabNavigation({
  activeTab,
  onTabChange,
  availableTabs
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableTabs: typeof TAB_CONFIG;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="hidden md:flex items-center relative">
      {/* Left scroll button */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 z-10 bg-gray-900/80 backdrop-blur-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Tab list */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide gap-1 px-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap",
              "hover:bg-gray-800/50",
              activeTab === tab.id
                ? "bg-purple-600/20 text-purple-400 shadow-lg"
                : "text-gray-400 hover:text-gray-200"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 z-10 bg-gray-900/80 backdrop-blur-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Gradient overlays */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-950/80 to-transparent pointer-events-none z-5" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-950/80 to-transparent pointer-events-none z-5" />
      )}
    </div>
  );
}

export const GameTabs = memo(function GameTabs({
  game,
  profile,
  activeTab,
  onTabChange,
  progress: _progress,
  activities,
}: GameTabsProps) {
  // Filter available tabs based on content availability
  const availableTabs = useMemo(() => {
    return TAB_CONFIG.filter(tab => {
      switch (tab.id) {
        case 'media':
          return (game.screenshots?.length || 0) > 0 || (game.videos?.length || 0) > 0;
        case 'achievements':
          return game.achievements && game.achievements.total > 0;
        case 'activity':
          return activities.data.length > 0 || !activities.loading;
        default:
          return true;
      }
    });
  }, [game, activities]);

  // Ensure active tab is valid
  useEffect(() => {
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      onTabChange('overview');
    }
  }, [activeTab, availableTabs, onTabChange]);

  return (
    <div className="bg-gradient-to-b from-gray-950/60 to-gray-950/80 backdrop-blur-md border-t border-gray-800/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          {/* Tab navigation */}
          <div className="py-6 border-b border-gray-800/30">
            <MobileTabSelector
              activeTab={activeTab}
              onTabChange={onTabChange}
              availableTabs={availableTabs}
            />
            <DesktopTabNavigation
              activeTab={activeTab}
              onTabChange={onTabChange}
              availableTabs={availableTabs}
            />
          </div>

          {/* Tab content with optimized loading */}
          <div className="py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="overview" className="focus-visible:outline-none">
                  <OverviewTab
                    game={game}
                    onViewMoreRelated={() => onTabChange("related")}
                  />
                </TabsContent>

                <TabsContent value="media" className="focus-visible:outline-none">
                  <Suspense fallback={<TabLoadingFallback tabId="media" />}>
                    <MediaTab game={game} />
                  </Suspense>
                </TabsContent>

                <TabsContent value="achievements" className="focus-visible:outline-none">
                  <Suspense fallback={<TabLoadingFallback tabId="achievements" />}>
                    <AchievementsTab game={game} profile={profile} />
                  </Suspense>
                </TabsContent>

                <TabsContent value="related" className="focus-visible:outline-none">
                  <Suspense fallback={<TabLoadingFallback tabId="related" />}>
                    <RelatedTab game={game} />
                  </Suspense>
                </TabsContent>

                <TabsContent value="activity" className="focus-visible:outline-none">
                  <Suspense fallback={<TabLoadingFallback tabId="activity" />}>
                    <ActivityTab gameId={game.id} activities={activities} />
                  </Suspense>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  );
});
