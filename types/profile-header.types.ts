/**
 * TypeScript interfaces for ProfileHeader component
 * Uses precise typing and clean separation of concerns
 */

import type { Profile } from "@/types/profile";
import type { GameStats } from "@/types/user";
import type { LucideIcon } from "lucide-react";
import type { 
  LevelBadgeKey,
  GamingBadgeKey, 
  CompletionBadgeKey,
  StreakBadgeKey,
  SpecialBadgeKey,
  ActionButtonKey
} from "@/config/profile-header-config";

/**
 * Main ProfileHeader props interface
 */
export interface ProfileHeaderProps {
  profile: Profile;
  stats: GameStats;
  onProfileUpdate?: () => void;
}

/**
 * Processed user data with computed values
 */
export interface ProcessedUserData {
  displayName: string;
  username: string;
  avatarUrl?: string;
  avatarInitials: string;
  memberSinceYear: number;
  level: number;
  currentStreak: number;
  completionRate: string;
  completionRateNumber: number;
  shouldShowPro: boolean;
}

/**
 * Badge configuration interface
 */
export interface BadgeConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  className: string;
}

/**
 * Achievement badges collection
 */
export interface AchievementBadges {
  level?: BadgeConfig;
  gaming?: BadgeConfig;
  completion?: BadgeConfig;
  streak?: BadgeConfig;
  special?: BadgeConfig;
}

/**
 * Stats card configuration
 */
export interface StatsCardConfig {
  key: keyof GameStats;
  icon: LucideIcon;
  label: string;
  value: number;
  colorScheme: {
    bg: string;
    border: string;
    icon: string;
  };
}

/**
 * Action button configuration
 */
export interface ActionButtonConfig {
  key: ActionButtonKey;
  icon: LucideIcon;
  label: string;
  className: string;
  iconAnimation: string;
  ariaLabel: string;
  onClick?: () => void;
}

/**
 * Component props for sub-components
 */

/**
 * Avatar section props
 */
export interface AvatarSectionProps {
  userData: ProcessedUserData;
  profile: Profile;
}

/**
 * User info section props  
 */
export interface UserInfoSectionProps {
  userData: ProcessedUserData;
  profile: Profile;
}

/**
 * Stats grid section props
 */
export interface StatsGridSectionProps {
  stats: GameStats;
  completionRate: string;
  completionRateNumber: number;
}

/**
 * Individual stat card props
 */
export interface StatCardProps {
  config: StatsCardConfig;
}

/**
 * Completion rate card props (special stat card)
 */
export interface CompletionRateCardProps {
  completionRate: string;
  completionRateNumber: number;
  shouldShowPing: boolean;
}

/**
 * Action buttons section props
 */
export interface ActionButtonsSectionProps {
  onProfileUpdate?: () => void;
}

/**
 * Individual action button props
 */
export interface ActionButtonProps {
  config: ActionButtonConfig;
}

/**
 * Achievement badges section props
 */
export interface AchievementBadgesSectionProps {
  badges: BadgeConfig[];
  shouldShow: boolean;
}

/**
 * Individual achievement badge props
 */
export interface AchievementBadgeProps {
  badge: BadgeConfig;
}

/**
 * Background effects props
 */
export interface BackgroundEffectsProps {
  // No props needed - pure visual component
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  easing?: string;
  delay?: number;
}

/**
 * Color scheme configuration
 */
export interface ColorScheme {
  background: string;
  border: string;
  text: string;
  icon: string;
  hover?: {
    background?: string;
    border?: string;
    text?: string;
    icon?: string;
  };
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  columns: {
    avatar: number;
    stats: number;
    actions: number;
  };
  spacing: {
    gap: string;
    padding: string;
  };
  responsive: {
    breakpoints: string[];
    columns: Record<string, number>;
  };
}

/**
 * Progress bar configuration
 */
export interface ProgressBarConfig {
  height: string;
  background: string;
  fill: string;
  animation: {
    duration: number;
    easing: string;
  };
  effects: {
    shine: boolean;
    ping: boolean;
    pingThreshold: number;
  };
}

/**
 * Type guards for badge types
 */
export function isLevelBadge(key: string): key is LevelBadgeKey {
  return ['MASTER', 'EXPERT', 'ADVANCED', 'RISING'].includes(key);
}

export function isGamingBadge(key: string): key is GamingBadgeKey {
  return ['VETERAN', 'GAMER'].includes(key);
}

export function isCompletionBadge(key: string): key is CompletionBadgeKey {
  return ['PERFECTIONIST', 'FINISHER', 'DEDICATED'].includes(key);
}

export function isStreakBadge(key: string): key is StreakBadgeKey {
  return ['FIRE_MASTER', 'HOT_STREAK', 'ON_FIRE', 'CONSISTENT'].includes(key);
}

export function isSpecialBadge(key: string): key is SpecialBadgeKey {
  return ['ACTIVE_YEAR', 'PRO'].includes(key);
}

/**
 * Utility types
 */
export type BadgeType = 'level' | 'gaming' | 'completion' | 'streak' | 'special';
export type ComponentState = 'loading' | 'error' | 'success';
export type ResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Error types
 */
export interface ProfileHeaderError {
  type: 'calculation' | 'rendering' | 'data';
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Event handlers
 */
export interface ProfileHeaderEvents {
  onProfileUpdate?: () => void;
  onBadgeClick?: (badge: BadgeConfig) => void;
  onStatsClick?: (statsKey: keyof GameStats) => void;
  onError?: (error: ProfileHeaderError) => void;
}