"use client";

import React, { memo, Suspense, useState, useEffect, useMemo, useRef } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { OverviewTab } from "./OverviewTab";
import { 
  TAB_DEFINITIONS,
  SKELETON_CONFIGS,
  MOBILE_CONFIG,
  DESKTOP_CONFIG,
  CONTAINER_CONFIG,
  TAB_ANIMATIONS,
  SCROLL_CONFIG
} from "@/config/game-tabs-config";
import {
  getAvailableTabs,
  validateActiveTab,
  getDefaultTab,
  shouldShowScrollButtons,
  scrollTabContainer,
  getTabSkeletonContent,
  getTabAccessibilityProps,
  getTabPanelAccessibilityProps
} from "@/utils/game-tabs-utils";
import type {
  GameTabsProps,
  MobileTabSelectorProps,
  DesktopTabNavigationProps,
  TabLoadingFallbackProps,
  ScrollButtonsState,
  TabDefinition
} from "@/types/game-tabs.types";

// Lazy load heavy tab components
const MediaTab = React.lazy(() => import("./MediaTab").then(module => ({ default: module.MediaTab })));
const AchievementsTab = React.lazy(() => import("./AchievementsTab").then(module => ({ default: module.AchievementsTab })));
const ActivityTab = React.lazy(() => import("./ActivityTab").then(module => ({ default: module.ActivityTab })));
const RelatedTab = React.lazy(() => import("./RelatedTab").then(module => ({ default: module.RelatedTab })));

const TabLoadingFallback = memo(function TabLoadingFallback({ tabId }: TabLoadingFallbackProps) {
  const { type, config } = getTabSkeletonContent(tabId || 'default');
  
  if (type === 'default') {
    return (
      <div className={config.containerClassName}>
        <div className="text-center space-y-4">
          {config.icon && (
            <config.icon className={config.iconClassName} />
          )}
          <p className="text-gray-400">{config.message}</p>
        </div>
      </div>
    );
  }
  
  if (config.type === 'grid') {
    const { columns, itemCount, template } = config;
    return (
      <div className={cn(
        "grid gap-4",
        `grid-cols-1 sm:grid-cols-${columns?.sm || 2} md:grid-cols-${columns?.md || 3} lg:grid-cols-${columns?.lg || 4}`
      )}>
        {Array.from({ length: itemCount || 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            {template?.image && (
              <div className={cn(template.image.aspectRatio, template.image.className)} />
            )}
            {template?.content?.map((content, idx) => (
              <div
                key={idx}
                className={cn(
                  `h-${content.height}`,
                  content.width && `w-${content.width}`,
                  content.className
                )}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
  
  if (config.type === 'list') {
    const { itemCount, template } = config;
    return (
      <div className="space-y-4">
        {Array.from({ length: itemCount || 6 }).map((_, i) => (
          <div key={i} className={cn("flex items-center gap-4", template?.container?.className)}>
            {template?.icon && (
              <div className={cn(
                `w-${template.icon.width} h-${template.icon.height}`,
                template.icon.className
              )} />
            )}
            {template?.avatar && (
              <div className={cn(
                `w-${template.avatar.width} h-${template.avatar.height}`,
                template.avatar.className
              )} />
            )}
            <div className="flex-1 space-y-2">
              {template?.content?.map((content, idx) => (
                <div
                  key={idx}
                  className={cn(
                    `h-${content.height}`,
                    content.width && `w-${content.width}`,
                    content.className
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    </div>
  );
});

const MobileTabSelector = memo(function MobileTabSelector({
  activeTab,
  onTabChange,
  availableTabs
}: MobileTabSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeTabConfig = availableTabs.find(tab => tab.id === activeTab);

  const handleTabSelect = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <div className="relative md:hidden">
      <Button
        variant={MOBILE_CONFIG.BUTTON.variant}
        className={MOBILE_CONFIG.BUTTON.className}
        onClick={() => setIsOpen(!isOpen)}
        {...getTabAccessibilityProps(
          activeTabConfig || availableTabs[0],
          true
        )}
      >
        <div className="flex items-center gap-2">
          {activeTabConfig?.icon && (
            <activeTabConfig.icon className="w-4 h-4" />
          )}
          <span>{activeTabConfig?.label}</span>
        </div>
        <Menu className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...MOBILE_CONFIG.DROPDOWN.animation}
            className={MOBILE_CONFIG.DROPDOWN.className}
          >
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                  "hover:bg-gray-800/50 first:rounded-t-lg last:rounded-b-lg",
                  activeTab === tab.id
                    ? "bg-purple-600/20 text-purple-400"
                    : "text-gray-300"
                )}
                onClick={() => handleTabSelect(tab.id)}
                {...getTabAccessibilityProps(tab, activeTab === tab.id)}
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

      {isOpen && (
        <div
          className={MOBILE_CONFIG.BACKDROP.className}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
});

const DesktopTabNavigation = memo(function DesktopTabNavigation({
  activeTab,
  onTabChange,
  availableTabs
}: DesktopTabNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollButtons, setScrollButtons] = useState<ScrollButtonsState>({
    canScrollLeft: false,
    canScrollRight: false
  });

  const updateScrollButtons = () => {
    const buttons = shouldShowScrollButtons(scrollContainerRef.current);
    setScrollButtons(buttons);
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    scrollTabContainer(
      scrollContainerRef.current,
      direction,
      SCROLL_CONFIG.AMOUNT
    );
  };

  return (
    <div className={DESKTOP_CONFIG.CONTAINER.className}>
      {scrollButtons.canScrollLeft && (
        <Button
          variant={DESKTOP_CONFIG.SCROLL_BUTTONS.variant}
          size={DESKTOP_CONFIG.SCROLL_BUTTONS.size}
          className={cn(
            DESKTOP_CONFIG.SCROLL_BUTTONS.className,
            "left-0"
          )}
          onClick={() => handleScroll('left')}
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      <div
        ref={scrollContainerRef}
        className={DESKTOP_CONFIG.SCROLL_CONTAINER.className}
        style={DESKTOP_CONFIG.SCROLL_CONTAINER.style}
      >
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              DESKTOP_CONFIG.TAB_BUTTON.className.base,
              activeTab === tab.id
                ? DESKTOP_CONFIG.TAB_BUTTON.className.active
                : DESKTOP_CONFIG.TAB_BUTTON.className.inactive
            )}
            onClick={() => onTabChange(tab.id)}
            {...getTabAccessibilityProps(tab, activeTab === tab.id)}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {scrollButtons.canScrollRight && (
        <Button
          variant={DESKTOP_CONFIG.SCROLL_BUTTONS.variant}
          size={DESKTOP_CONFIG.SCROLL_BUTTONS.size}
          className={cn(
            DESKTOP_CONFIG.SCROLL_BUTTONS.className,
            "right-0"
          )}
          onClick={() => handleScroll('right')}
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {scrollButtons.canScrollLeft && (
        <div className={DESKTOP_CONFIG.GRADIENTS.left} />
      )}
      {scrollButtons.canScrollRight && (
        <div className={DESKTOP_CONFIG.GRADIENTS.right} />
      )}
    </div>
  );
});

const TabContentSection = memo(function TabContentSection({
  activeTab,
  game,
  profile,
  activities,
  onTabChange
}: {
  activeTab: string;
  game: GameTabsProps['game'];
  profile: GameTabsProps['profile'];
  activities: GameTabsProps['activities'];
  onTabChange: (tab: string) => void;
}) {
  const availableTabsData = useMemo(() => getAvailableTabs(game, activities), [game, activities]);
  const activeTabData = availableTabsData.find(tab => tab.id === activeTab);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={TAB_ANIMATIONS.VARIANTS.INITIAL}
        animate={TAB_ANIMATIONS.VARIANTS.ENTER}
        exit={TAB_ANIMATIONS.VARIANTS.EXIT}
        transition={{ 
          duration: TAB_ANIMATIONS.DURATIONS.NORMAL,
          ease: TAB_ANIMATIONS.TRANSITIONS.SMOOTH 
        }}
      >
        <TabsContent 
          value="overview" 
          className={CONTAINER_CONFIG.TAB_CONTENT.className}
          {...(activeTabData && getTabPanelAccessibilityProps(activeTabData, activeTab === 'overview'))}
        >
          <OverviewTab
            game={game}
            onViewMoreRelated={() => onTabChange("related")}
          />
        </TabsContent>

        <TabsContent 
          value="media" 
          className={CONTAINER_CONFIG.TAB_CONTENT.className}
          {...(activeTabData && getTabPanelAccessibilityProps(activeTabData, activeTab === 'media'))}
        >
          <Suspense fallback={<TabLoadingFallback tabId="media" />}>
            <MediaTab game={game as any} />
          </Suspense>
        </TabsContent>

        <TabsContent 
          value="achievements" 
          className={CONTAINER_CONFIG.TAB_CONTENT.className}
          {...(activeTabData && getTabPanelAccessibilityProps(activeTabData, activeTab === 'achievements'))}
        >
          <Suspense fallback={<TabLoadingFallback tabId="achievements" />}>
            <AchievementsTab game={game} profile={profile} />
          </Suspense>
        </TabsContent>

        <TabsContent 
          value="related" 
          className={CONTAINER_CONFIG.TAB_CONTENT.className}
          {...(activeTabData && getTabPanelAccessibilityProps(activeTabData, activeTab === 'related'))}
        >
          <Suspense fallback={<TabLoadingFallback tabId="related" />}>
            <RelatedTab game={game} />
          </Suspense>
        </TabsContent>

        <TabsContent 
          value="activity" 
          className={CONTAINER_CONFIG.TAB_CONTENT.className}
          {...(activeTabData && getTabPanelAccessibilityProps(activeTabData, activeTab === 'activity'))}
        >
          <Suspense fallback={<TabLoadingFallback tabId="activity" />}>
            <ActivityTab gameId={game.id} activities={activities} />
          </Suspense>
        </TabsContent>
      </motion.div>
    </AnimatePresence>
  );
});

export const GameTabs = memo(function GameTabs({
  game,
  profile,
  activeTab,
  onTabChange,
  activities,
}: GameTabsProps) {
  const availableTabs = useMemo(() => getAvailableTabs(game, activities), [game, activities]);

  useEffect(() => {
    if (!validateActiveTab(activeTab, availableTabs)) {
      const defaultTab = getDefaultTab(availableTabs);
      onTabChange(defaultTab);
    }
  }, [activeTab, availableTabs, onTabChange]);

  return (
    <div className={CONTAINER_CONFIG.MAIN.className}>
      <div className={CONTAINER_CONFIG.INNER.className}>
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <div className={CONTAINER_CONFIG.NAVIGATION.className}>
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

          <div className={CONTAINER_CONFIG.CONTENT.className}>
            <TabContentSection
              activeTab={activeTab}
              game={game}
              profile={profile}
              activities={activities}
              onTabChange={onTabChange}
            />
          </div>
        </Tabs>
      </div>
    </div>
  );
});