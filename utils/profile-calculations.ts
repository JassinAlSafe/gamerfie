/**
 * Pure calculation functions for ProfileCard component
 * All functions are pure, testable, and side-effect free
 */

import { 
  ACTIVITY_BADGES, 
  PROGRESS_COLORS, 
  PROGRESS_THRESHOLDS,
  type ActivityBadgeVariant 
} from "@/config/profile-config";
import type { LucideIcon } from "lucide-react";

/**
 * Calculates completion percentage from completed and total games
 * @param completed Number of completed games
 * @param total Total number of games
 * @returns Completion percentage (0-100)
 */
export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Determines activity level based on completion percentage
 * @param percentage Completion percentage (0-100)
 * @returns Activity badge configuration
 */
export function getActivityLevel(percentage: number): {
  label: string;
  variant: ActivityBadgeVariant;
  icon: LucideIcon;
} {
  if (percentage >= ACTIVITY_BADGES.EXPERT.threshold) {
    return {
      label: ACTIVITY_BADGES.EXPERT.label,
      variant: ACTIVITY_BADGES.EXPERT.variant,
      icon: ACTIVITY_BADGES.EXPERT.icon
    };
  }
  
  if (percentage >= ACTIVITY_BADGES.ACTIVE.threshold) {
    return {
      label: ACTIVITY_BADGES.ACTIVE.label, 
      variant: ACTIVITY_BADGES.ACTIVE.variant,
      icon: ACTIVITY_BADGES.ACTIVE.icon
    };
  }
  
  if (percentage >= ACTIVITY_BADGES.RISING.threshold) {
    return {
      label: ACTIVITY_BADGES.RISING.label,
      variant: ACTIVITY_BADGES.RISING.variant, 
      icon: ACTIVITY_BADGES.RISING.icon
    };
  }
  
  return {
    label: ACTIVITY_BADGES.STARTER.label,
    variant: ACTIVITY_BADGES.STARTER.variant,
    icon: ACTIVITY_BADGES.STARTER.icon
  };
}

/**
 * Gets progress bar color scheme based on completion percentage
 * @param percentage Completion percentage (0-100)
 * @returns CSS class for progress bar gradient
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage >= PROGRESS_THRESHOLDS.HIGH) return PROGRESS_COLORS.HIGH;
  if (percentage >= PROGRESS_THRESHOLDS.MEDIUM) return PROGRESS_COLORS.MEDIUM;
  if (percentage >= PROGRESS_THRESHOLDS.LOW) return PROGRESS_COLORS.LOW;
  return PROGRESS_COLORS.MINIMAL;
}

/**
 * Safely formats a date string for display
 * @param dateString ISO date string
 * @returns Formatted date string or "Unknown"
 */
export function formatMemberDate(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";
    
    // Use consistent format that works the same on server and client
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}/${year}`;
  } catch {
    return "Unknown";
  }
}

/**
 * Safely extracts display name from user metadata
 * @param email User's email
 * @param displayName User's display name from metadata
 * @returns Formatted display name
 */
export function getDisplayName(email: string | null, displayName?: string | null): string {
  if (displayName?.trim()) return displayName;
  if (email) return email.split('@')[0];
  return 'Gamer';
}

/**
 * Gets the user's avatar initials
 * @param email User's email
 * @param displayName User's display name
 * @returns Single character for avatar fallback
 */
export function getAvatarInitials(email: string | null, displayName?: string | null): string {
  if (displayName?.trim()) return displayName.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return 'G';
}

/**
 * Calculates remaining games based on total and completed
 * @param total Total games
 * @param completed Completed games  
 * @returns Number of remaining games
 */
export function getRemainingGames(total: number, completed: number): number {
  return Math.max(0, total - completed);
}