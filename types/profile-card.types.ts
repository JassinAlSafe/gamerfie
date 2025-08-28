/**
 * TypeScript interfaces for ProfileCard component
 * Uses discriminated unions and precise typing for better type safety
 */

import type { User } from "@supabase/supabase-js";

/**
 * Friend entity interface
 */
export interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
}

/**
 * Profile statistics interface
 */
export interface ProfileStats {
  totalGames: number;
  completedGames: number;
  totalPlaytime: number;
  averageRating: number;
}

/**
 * Discriminated union for friends data
 * Eliminates need for runtime type checking
 */
export type FriendsData = 
  | { type: 'count'; count: number }
  | { type: 'list'; items: Friend[] };

/**
 * Safe stats interface with guaranteed default values
 */
export interface SafeStats {
  totalGames: number;
  completedGames: number;
  totalPlaytime: number;
  averageRating: number;
}

/**
 * Activity badge configuration
 */
export interface ActivityBadge {
  label: string;
  variant: 'default' | 'secondary' | 'outline';
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Stat card configuration interface
 */
export interface StatCardConfig {
  key: keyof SafeStats | 'friends';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tooltip: string;
  colorScheme: {
    bg: string;
    hover: string;
    border: string;
    icon: string;
  };
}

/**
 * Progress milestone interface
 */
export interface ProgressMilestone {
  percentage: number;
  isReached: boolean;
}

/**
 * Main ProfileCard props interface
 */
export interface ProfileCardProps {
  user: User;
  stats?: ProfileStats;
  friends: FriendsData;
  isLoading?: boolean;
}

/**
 * User profile section props
 */
export interface UserProfileProps {
  user: User;
  activityBadge: ActivityBadge;
}

/**
 * Stats grid section props
 */
export interface StatsGridProps {
  stats: SafeStats;
  friendsCount: number;
}

/**
 * Progress section props
 */
export interface ProgressSectionProps {
  stats: SafeStats;
  completionPercentage: number;
}

/**
 * Quick actions section props  
 */
export interface QuickActionsProps {
  className?: string;
}

/**
 * Empty state section props
 */
export interface EmptyStateProps {
  // No additional props needed for empty state
}

/**
 * Helper type for stat values
 */
export type StatValue = number;

/**
 * Helper type for extracting friends count from union
 */
export type FriendsCount = number;

/**
 * Component display state union
 */
export type ComponentState = 
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'success'; data: SafeStats };

/**
 * Type guard for friends data
 */
export function isFriendsList(friends: FriendsData): friends is { type: 'list'; items: Friend[] } {
  return friends.type === 'list';
}

/**
 * Type guard for friends count
 */
export function isFriendsCount(friends: FriendsData): friends is { type: 'count'; count: number } {
  return friends.type === 'count';
}