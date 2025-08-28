/**
 * Pure calculation functions for ProfileHeader component
 * All functions are pure, testable, and side-effect free
 */

import { 
  LEVEL_BADGES,
  GAMING_BADGES, 
  COMPLETION_BADGES,
  STREAK_BADGES,
  SPECIAL_BADGES,
  type LevelBadgeKey,
  type GamingBadgeKey,
  type CompletionBadgeKey,
  type StreakBadgeKey,
  type SpecialBadgeKey
} from "@/config/profile-header-config";
import type { LucideIcon } from "lucide-react";

/**
 * Calculates completion rate from total played and backlog
 * @param totalPlayed Number of games played
 * @param backlog Number of games in backlog
 * @returns Completion rate as string percentage
 */
export function calculateCompletionRate(totalPlayed: number, backlog: number): string {
  if (totalPlayed <= 0) return "0";
  const rate = (totalPlayed / (totalPlayed + backlog)) * 100;
  return rate.toFixed(0);
}

/**
 * Calculates user level based on games played
 * @param totalPlayed Number of games played
 * @returns User level (minimum 1)
 */
export function calculateUserLevel(totalPlayed: number): number {
  return Math.floor(totalPlayed / 10) + 1;
}

/**
 * Gets member since year from profile creation date
 * @param createdAt ISO date string or Date object
 * @returns Year as number or current year as fallback
 */
export function getMemberSinceYear(createdAt: string | Date | null | undefined): number {
  if (!createdAt) return new Date().getFullYear();
  
  try {
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    if (isNaN(date.getTime())) return new Date().getFullYear();
    return date.getFullYear();
  } catch {
    return new Date().getFullYear();
  }
}

/**
 * Generates current streak (placeholder implementation)
 * TODO: Replace with actual streak calculation logic
 * @returns Random streak between 1-15 days
 */
export function getCurrentStreak(): number {
  // Placeholder - in real implementation, this would calculate actual streak
  return Math.floor(Math.random() * 15) + 1;
}

/**
 * Determines if user qualifies for Pro badge
 * @param level User level
 * @returns True if user should have Pro badge
 */
export function shouldShowProBadge(level: number): boolean {
  return level >= SPECIAL_BADGES.PRO.threshold;
}

/**
 * Gets level badge based on user level
 * @param level User level
 * @returns Level badge configuration or null
 */
export function getLevelBadge(level: number): (typeof LEVEL_BADGES[LevelBadgeKey] & { key: LevelBadgeKey }) | null {
  if (level >= LEVEL_BADGES.MASTER.threshold) {
    return { ...LEVEL_BADGES.MASTER, key: 'MASTER' };
  }
  if (level >= LEVEL_BADGES.EXPERT.threshold) {
    return { ...LEVEL_BADGES.EXPERT, key: 'EXPERT' };
  }
  if (level >= LEVEL_BADGES.ADVANCED.threshold) {
    return { ...LEVEL_BADGES.ADVANCED, key: 'ADVANCED' };
  }
  if (level >= LEVEL_BADGES.RISING.threshold) {
    return { ...LEVEL_BADGES.RISING, key: 'RISING' };
  }
  return null;
}

/**
 * Gets gaming activity badge based on total games played
 * @param totalPlayed Number of games played
 * @returns Gaming badge configuration or null
 */
export function getGamingBadge(totalPlayed: number): (typeof GAMING_BADGES[GamingBadgeKey] & { key: GamingBadgeKey }) | null {
  if (totalPlayed >= GAMING_BADGES.VETERAN.threshold) {
    return { ...GAMING_BADGES.VETERAN, key: 'VETERAN' };
  }
  if (totalPlayed >= GAMING_BADGES.GAMER.threshold) {
    return { ...GAMING_BADGES.GAMER, key: 'GAMER' };
  }
  return null;
}

/**
 * Gets completion badge based on completion rate
 * @param completionRate Completion rate as percentage number
 * @returns Completion badge configuration or null
 */
export function getCompletionBadge(completionRate: number): (typeof COMPLETION_BADGES[CompletionBadgeKey] & { key: CompletionBadgeKey }) | null {
  if (completionRate >= COMPLETION_BADGES.PERFECTIONIST.threshold) {
    return { ...COMPLETION_BADGES.PERFECTIONIST, key: 'PERFECTIONIST' };
  }
  if (completionRate >= COMPLETION_BADGES.FINISHER.threshold) {
    return { ...COMPLETION_BADGES.FINISHER, key: 'FINISHER' };
  }
  if (completionRate >= COMPLETION_BADGES.DEDICATED.threshold) {
    return { ...COMPLETION_BADGES.DEDICATED, key: 'DEDICATED' };
  }
  return null;
}

/**
 * Gets streak badge based on current streak
 * @param currentStreak Current streak in days
 * @returns Streak badge configuration or null
 */
export function getStreakBadge(currentStreak: number): (typeof STREAK_BADGES[StreakBadgeKey] & { key: StreakBadgeKey }) | null {
  if (currentStreak >= STREAK_BADGES.FIRE_MASTER.threshold) {
    return { ...STREAK_BADGES.FIRE_MASTER, key: 'FIRE_MASTER' };
  }
  if (currentStreak >= STREAK_BADGES.HOT_STREAK.threshold) {
    return { ...STREAK_BADGES.HOT_STREAK, key: 'HOT_STREAK' };
  }
  if (currentStreak >= STREAK_BADGES.ON_FIRE.threshold) {
    return { ...STREAK_BADGES.ON_FIRE, key: 'ON_FIRE' };
  }
  if (currentStreak >= STREAK_BADGES.CONSISTENT.threshold) {
    return { ...STREAK_BADGES.CONSISTENT, key: 'CONSISTENT' };
  }
  return null;
}

/**
 * Gets special activity badge based on yearly activity
 * @param playedThisYear Games played this year
 * @returns Special badge configuration or null
 */
export function getSpecialActivityBadge(playedThisYear: number): (typeof SPECIAL_BADGES[SpecialBadgeKey] & { key: SpecialBadgeKey }) | null {
  if (playedThisYear >= SPECIAL_BADGES.ACTIVE_YEAR.threshold) {
    return { ...SPECIAL_BADGES.ACTIVE_YEAR, key: 'ACTIVE_YEAR' };
  }
  return null;
}

/**
 * Badge configuration interface for type safety
 */
export interface BadgeConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  className: string;
}

/**
 * Gets all applicable achievement badges for a user
 * @param level User level
 * @param totalPlayed Total games played
 * @param completionRate Completion rate as percentage
 * @param currentStreak Current streak in days
 * @param playedThisYear Games played this year
 * @returns Array of achievement badge configurations
 */
export function getAllAchievementBadges(
  level: number,
  totalPlayed: number,
  completionRate: number,
  currentStreak: number,
  playedThisYear: number
): BadgeConfig[] {
  const badges: BadgeConfig[] = [];

  // Level badges (only one)
  const levelBadge = getLevelBadge(level);
  if (levelBadge) {
    badges.push(levelBadge);
  }

  // Gaming activity badges
  const gamingBadge = getGamingBadge(totalPlayed);
  if (gamingBadge) {
    badges.push(gamingBadge);
  }

  // Completion badges
  const completionBadge = getCompletionBadge(completionRate);
  if (completionBadge) {
    badges.push(completionBadge);
  }

  // Streak badges
  const streakBadge = getStreakBadge(currentStreak);
  if (streakBadge) {
    badges.push(streakBadge);
  }

  // Special activity badges
  const specialBadge = getSpecialActivityBadge(playedThisYear);
  if (specialBadge) {
    badges.push(specialBadge);
  }

  return badges;
}

/**
 * Determines if achievements section should be shown
 * @param level User level
 * @param totalPlayed Total games played
 * @param completionRate Completion rate as percentage
 * @param currentStreak Current streak in days
 * @returns True if any achievement criteria is met
 */
export function shouldShowAchievements(
  level: number,
  totalPlayed: number,
  completionRate: number,
  currentStreak: number
): boolean {
  return (
    level >= LEVEL_BADGES.RISING.threshold ||
    totalPlayed >= GAMING_BADGES.GAMER.threshold ||
    completionRate >= COMPLETION_BADGES.DEDICATED.threshold ||
    currentStreak >= STREAK_BADGES.CONSISTENT.threshold
  );
}

/**
 * Determines if progress bar should show ping animation
 * @param completionRate Completion rate as percentage
 * @returns True if ping animation should be shown
 */
export function shouldShowProgressPing(completionRate: number): boolean {
  return completionRate > 50;
}