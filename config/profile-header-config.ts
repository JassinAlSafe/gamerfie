/**
 * Configuration constants for ProfileHeader component
 * Single source of truth for thresholds, badges, stats, and animations
 */

import { 
  Edit3, 
  Plus, 
  UserPlus, 
  Trophy, 
  Calendar,
  Target,
  Gamepad2,
  TrendingUp,
  Award,
  Flame,
  Star,
  Crown,
  Zap
} from "lucide-react";

// Level thresholds for different achievement tiers
export const LEVEL_THRESHOLDS = {
  MASTER: 20,
  EXPERT: 10,
  ADVANCED: 5,
  RISING: 3
} as const;

// Gaming activity thresholds
export const GAMING_ACTIVITY_THRESHOLDS = {
  VETERAN: 100,
  GAMER: 50
} as const;

// Completion rate thresholds (percentages)
export const COMPLETION_THRESHOLDS = {
  PERFECTIONIST: 75,
  FINISHER: 50,
  DEDICATED: 25
} as const;

// Streak thresholds (days)
export const STREAK_THRESHOLDS = {
  FIRE_MASTER: 30,
  HOT_STREAK: 14,
  ON_FIRE: 7,
  CONSISTENT: 3
} as const;

// Special activity thresholds
export const ACTIVITY_THRESHOLDS = {
  ACTIVE_YEAR: 20,
  PRO_LEVEL: 10
} as const;

// Level badge configuration
export const LEVEL_BADGES = {
  MASTER: {
    threshold: LEVEL_THRESHOLDS.MASTER,
    label: "Master",
    icon: Crown,
    className: "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-200 border-amber-500/40 text-xs hover:from-amber-500/40 hover:to-yellow-500/40 transition-all duration-200 shadow-lg shadow-amber-500/20"
  },
  EXPERT: {
    threshold: LEVEL_THRESHOLDS.EXPERT,
    label: "Expert",
    icon: Zap,
    className: "bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-200 border-purple-500/40 text-xs hover:from-purple-500/40 hover:to-indigo-500/40 transition-all duration-200"
  },
  ADVANCED: {
    threshold: LEVEL_THRESHOLDS.ADVANCED,
    label: "Advanced",
    icon: Trophy,
    className: "bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-300 border-yellow-600/30 text-xs hover:from-yellow-600/30 hover:to-orange-600/30 transition-colors"
  },
  RISING: {
    threshold: LEVEL_THRESHOLDS.RISING,
    label: "Rising",
    icon: Target,
    className: "bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border-green-600/30 text-xs hover:from-green-600/30 hover:to-emerald-600/30 transition-colors"
  }
} as const;

// Gaming activity badges
export const GAMING_BADGES = {
  VETERAN: {
    threshold: GAMING_ACTIVITY_THRESHOLDS.VETERAN,
    label: "Veteran",
    icon: Gamepad2,
    className: "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 border-blue-600/30 text-xs hover:from-blue-600/30 hover:to-cyan-600/30 transition-colors"
  },
  GAMER: {
    threshold: GAMING_ACTIVITY_THRESHOLDS.GAMER,
    label: "Gamer",
    icon: Gamepad2,
    className: "bg-gradient-to-r from-blue-600/15 to-cyan-600/15 text-blue-400 border-blue-600/25 text-xs hover:from-blue-600/25 hover:to-cyan-600/25 transition-colors"
  }
} as const;

// Completion badges
export const COMPLETION_BADGES = {
  PERFECTIONIST: {
    threshold: COMPLETION_THRESHOLDS.PERFECTIONIST,
    label: "Perfectionist",
    icon: Award,
    className: "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-200 border-purple-600/40 text-xs hover:from-purple-600/40 hover:to-indigo-600/40 transition-all duration-200 shadow-lg shadow-purple-500/20"
  },
  FINISHER: {
    threshold: COMPLETION_THRESHOLDS.FINISHER,
    label: "Finisher",
    icon: Award,
    className: "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border-purple-600/30 text-xs hover:from-purple-600/30 hover:to-indigo-600/30 transition-colors"
  },
  DEDICATED: {
    threshold: COMPLETION_THRESHOLDS.DEDICATED,
    label: "Dedicated",
    icon: Award,
    className: "bg-gradient-to-r from-purple-600/15 to-indigo-600/15 text-purple-400 border-purple-600/25 text-xs hover:from-purple-600/25 hover:to-indigo-600/25 transition-colors"
  }
} as const;

// Streak badges
export const STREAK_BADGES = {
  FIRE_MASTER: {
    threshold: STREAK_THRESHOLDS.FIRE_MASTER,
    label: "Fire Master",
    icon: Flame,
    className: "bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-200 border-orange-500/40 text-xs hover:from-orange-500/40 hover:to-red-500/40 transition-all duration-200 shadow-lg shadow-orange-500/20"
  },
  HOT_STREAK: {
    threshold: STREAK_THRESHOLDS.HOT_STREAK,
    label: "Hot Streak",
    icon: Flame,
    className: "bg-gradient-to-r from-red-600/20 to-orange-600/20 text-orange-300 border-orange-600/30 text-xs hover:from-red-600/30 hover:to-orange-600/30 transition-colors"
  },
  ON_FIRE: {
    threshold: STREAK_THRESHOLDS.ON_FIRE,
    label: "On Fire",
    icon: Flame,
    className: "bg-gradient-to-r from-red-600/15 to-orange-600/15 text-red-400 border-red-600/25 text-xs hover:from-red-600/25 hover:to-orange-600/25 transition-colors"
  },
  CONSISTENT: {
    threshold: STREAK_THRESHOLDS.CONSISTENT,
    label: "Consistent",
    icon: Flame,
    className: "bg-gradient-to-r from-yellow-600/15 to-red-600/15 text-yellow-400 border-yellow-600/25 text-xs hover:from-yellow-600/25 hover:to-red-600/25 transition-colors"
  }
} as const;

// Special badges
export const SPECIAL_BADGES = {
  ACTIVE_YEAR: {
    threshold: ACTIVITY_THRESHOLDS.ACTIVE_YEAR,
    label: `Active ${new Date().getFullYear()}`,
    icon: Calendar,
    className: "bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-emerald-300 border-emerald-600/30 text-xs hover:from-emerald-600/30 hover:to-green-600/30 transition-colors"
  },
  PRO: {
    threshold: ACTIVITY_THRESHOLDS.PRO_LEVEL,
    label: "Pro",
    icon: Trophy,
    className: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30 px-1.5 py-0.5 text-xs"
  }
} as const;

// Stats card configuration for ProfileHeader
export const PROFILE_STATS_CARDS = {
  TOTAL_PLAYED: {
    key: "total_played" as const,
    icon: Gamepad2,
    label: "Games Played",
    colorScheme: {
      bg: "bg-gradient-to-br from-gray-800/40 to-gray-900/60",
      border: "border-gray-700/50 hover:border-purple-500/30",
      icon: "text-purple-400 group-hover:text-purple-300"
    }
  },
  PLAYED_THIS_YEAR: {
    key: "played_this_year" as const,
    icon: Target,
    label: "This Year",
    colorScheme: {
      bg: "bg-gradient-to-br from-gray-800/40 to-gray-900/60",
      border: "border-gray-700/50 hover:border-green-500/30",
      icon: "text-green-400 group-hover:text-green-300"
    }
  },
  BACKLOG: {
    key: "backlog" as const,
    icon: TrendingUp,
    label: "Backlog",
    colorScheme: {
      bg: "bg-gradient-to-br from-gray-800/40 to-gray-900/60",
      border: "border-gray-700/50 hover:border-blue-500/30",
      icon: "text-blue-400 group-hover:text-blue-300"
    }
  }
} as const;

// Action button configuration
export const ACTION_BUTTONS = {
  EDIT_PROFILE: {
    icon: Edit3,
    label: "Edit Profile",
    className: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-200 group flex-1",
    iconAnimation: "group-hover:rotate-6 transition-transform",
    ariaLabel: "Edit your profile information"
  },
  ADD_GAME: {
    icon: Plus,
    label: "Add Game",
    className: "bg-gray-800/50 border-gray-600/50 hover:bg-purple-900/30 hover:border-purple-500/50 text-gray-300 hover:text-white transition-all duration-200 group flex-1",
    iconAnimation: "group-hover:rotate-90 transition-transform",
    ariaLabel: "Add a new game to your collection"
  },
  INVITE_FRIENDS: {
    icon: UserPlus,
    label: "Invite",
    className: "bg-gray-800/50 border-gray-600/50 hover:bg-indigo-900/30 hover:border-indigo-500/50 text-gray-300 hover:text-white transition-all duration-200 group flex-1",
    iconAnimation: "group-hover:scale-110 transition-transform",
    ariaLabel: "Invite friends to join your gaming network"
  }
} as const;

// Animation durations
export const PROFILE_ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 1000,
  PROGRESS_BAR: 1000
} as const;

// Progress bar configuration
export const PROGRESS_CONFIG = {
  PING_THRESHOLD: 50, // Show ping animation when completion > 50%
  BAR_HEIGHT: "h-2",
  COLORS: {
    BACKGROUND: "bg-gray-800/60",
    FILL: "bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-400",
    SHINE: "bg-gradient-to-r from-transparent via-white/30 to-transparent"
  }
} as const;

export type LevelBadgeKey = keyof typeof LEVEL_BADGES;
export type GamingBadgeKey = keyof typeof GAMING_BADGES;
export type CompletionBadgeKey = keyof typeof COMPLETION_BADGES;
export type StreakBadgeKey = keyof typeof STREAK_BADGES;
export type SpecialBadgeKey = keyof typeof SPECIAL_BADGES;
export type StatsCardKey = keyof typeof PROFILE_STATS_CARDS;
export type ActionButtonKey = keyof typeof ACTION_BUTTONS;