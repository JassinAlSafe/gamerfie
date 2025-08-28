/**
 * Configuration constants for ProfileCard component
 * Single source of truth for thresholds, colors, and static data
 */

import { Award, Zap, Target, Star, Gamepad2, Trophy, Users } from "lucide-react";

// Activity level thresholds (percentages)
export const ACTIVITY_THRESHOLDS = {
  EXPERT: 80,
  ACTIVE: 60,
  RISING: 30,
  STARTER: 0
} as const;

// Progress bar milestone markers
export const PROGRESS_MILESTONES = [25, 50, 75] as const;

// Progress bar color schemes based on completion percentage
export const PROGRESS_COLORS = {
  HIGH: "bg-gradient-to-r from-green-500 to-emerald-600",    // 75%+
  MEDIUM: "bg-gradient-to-r from-blue-500 to-cyan-600",      // 50-74%
  LOW: "bg-gradient-to-r from-yellow-500 to-orange-600",     // 25-49%
  MINIMAL: "bg-gradient-to-r from-purple-500 to-violet-600" // 0-24%
} as const;

// Progress bar thresholds for color determination
export const PROGRESS_THRESHOLDS = {
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25
} as const;

// Activity badge configuration
export const ACTIVITY_BADGES = {
  EXPERT: {
    label: "Expert",
    variant: "default" as const,
    icon: Award,
    threshold: ACTIVITY_THRESHOLDS.EXPERT
  },
  ACTIVE: {
    label: "Active", 
    variant: "secondary" as const,
    icon: Zap,
    threshold: ACTIVITY_THRESHOLDS.ACTIVE
  },
  RISING: {
    label: "Rising",
    variant: "outline" as const, 
    icon: Target,
    threshold: ACTIVITY_THRESHOLDS.RISING
  },
  STARTER: {
    label: "Starter",
    variant: "outline" as const,
    icon: Star,
    threshold: ACTIVITY_THRESHOLDS.STARTER
  }
} as const;

// Stat card configuration
export const STAT_CARDS = {
  GAMES: {
    key: "totalGames" as const,
    icon: Gamepad2,
    label: "Games",
    tooltip: "Total games in your library",
    colorScheme: {
      bg: "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
      hover: "hover:from-blue-500/20 hover:to-blue-600/10",
      border: "border-blue-500/20",
      icon: "text-blue-500"
    }
  },
  COMPLETED: {
    key: "completedGames" as const,
    icon: Trophy,
    label: "Completed", 
    tooltip: "Games you've completed",
    colorScheme: {
      bg: "bg-gradient-to-br from-green-500/10 to-green-600/5",
      hover: "hover:from-green-500/20 hover:to-green-600/10", 
      border: "border-green-500/20",
      icon: "text-green-500"
    }
  },
  FRIENDS: {
    key: "friends" as const,
    icon: Users,
    label: "Friends",
    tooltip: "Gaming friends connected", 
    colorScheme: {
      bg: "bg-gradient-to-br from-purple-500/10 to-purple-600/5",
      hover: "hover:from-purple-500/20 hover:to-purple-600/10",
      border: "border-purple-500/20", 
      icon: "text-purple-500"
    }
  }
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300, 
  SLOW: 1000,
  PROGRESS_BAR: 1000
} as const;

export type ActivityBadgeVariant = typeof ACTIVITY_BADGES[keyof typeof ACTIVITY_BADGES]['variant'];
export type StatCardKey = typeof STAT_CARDS[keyof typeof STAT_CARDS]['key'];