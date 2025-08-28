import { LucideIcon } from "lucide-react";
import { Game } from "@/types";
import { Profile } from "@/types/profile";
import { TAB_DEFINITIONS, TAB_PRIORITIES, SKELETON_CONFIGS } from "@/config/game-tabs-config";

export type TabId = keyof typeof TAB_DEFINITIONS;
export type TabPriority = typeof TAB_PRIORITIES[keyof typeof TAB_PRIORITIES];
export type SkeletonType = keyof typeof SKELETON_CONFIGS;

export interface TabDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  priority: TabPriority;
  alwaysVisible: boolean;
  requiresContent: boolean;
  contentCheck?: (game: Game, activities?: any) => boolean;
}

export interface GameTabsProps {
  game: Game;
  profile: Profile | null;
  activeTab: string;
  onTabChange: (value: string) => void;
  progress: ProgressData;
  activities: ActivitiesData;
}

export interface ProgressData {
  playTime: number | null;
  completionPercentage: number | null;
  achievementsCompleted: number | null;
  loading: boolean;
  playTimeHistory: Array<{ date: string; hours: number }>;
  achievementHistory: Array<{ date: string; count: number }>;
}

export interface ActivitiesData {
  data: any[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export interface MobileTabSelectorProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableTabs: TabDefinition[];
}

export interface DesktopTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableTabs: TabDefinition[];
}

export interface TabLoadingFallbackProps {
  tabId?: string;
}

export interface TabContentProps {
  game: Game;
  profile: Profile | null;
  progress?: ProgressData;
  activities?: ActivitiesData;
}

export interface OverviewTabProps extends TabContentProps {
  onViewMoreRelated: () => void;
}

export interface MediaTabProps {
  game: Game;
}

export interface AchievementsTabProps {
  game: Game;
  profile: Profile | null;
}

export interface RelatedTabProps {
  game: Game;
}

export interface ActivityTabProps {
  gameId: string | number;
  activities: ActivitiesData;
}

export interface ScrollButtonsState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

export interface TabNavigationState {
  isScrollable: boolean;
  scrollButtons: ScrollButtonsState;
}

export interface SkeletonConfig {
  type: string;
  columns?: Record<string, number>;
  itemCount?: number;
  aspectRatio?: string;
  className?: string;
  template?: SkeletonTemplate;
  icon?: LucideIcon;
  iconClassName?: string;
  message?: string;
  containerClassName?: string;
}

export interface SkeletonTemplate {
  icon?: SkeletonElement;
  image?: SkeletonElement;
  avatar?: SkeletonElement;
  container?: SkeletonElement;
  content?: SkeletonElement[];
}

export interface SkeletonElement {
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  className?: string;
}

export interface TabAnimationConfig {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit: Record<string, any>;
  transition?: Record<string, any>;
}

export interface TabStyleConfig {
  className: {
    base: string;
    active: string;
    inactive: string;
  };
}

export interface MobileDropdownConfig {
  className: string;
  animation: TabAnimationConfig;
}

export interface TabAccessibilityProps {
  role: string;
  'aria-selected': boolean;
  'aria-label': string;
  tabIndex: number;
}

export interface TabPanelAccessibilityProps {
  role: string;
  'aria-labelledby': string;
  hidden: boolean;
  tabIndex: number;
}

export interface TabAnalytics {
  event: string;
  properties: {
    tab_id: string;
    tab_label?: string;
    tab_priority?: TabPriority;
    timestamp: string;
  };
}

export interface TabFilterQuery {
  gameId: string | number;
  tabId: string;
  [key: string]: any;
}

export type TabValidationResult = {
  isValid: boolean;
  fallbackTab?: string;
  reason?: string;
};

export type TabVisibilityCheck = (
  game: Game,
  activities?: ActivitiesData
) => boolean;

export type TabContentRenderer = (props: TabContentProps) => React.ReactNode;

export interface TabRegistry {
  [key: string]: {
    definition: TabDefinition;
    component: React.ComponentType<any>;
    loader?: () => Promise<{ default: React.ComponentType<any> }>;
  };
}