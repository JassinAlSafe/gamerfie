/**
 * Improved ProfileHeader component following "inevitable" TypeScript patterns
 * - Configuration-driven design
 * - Pure functions for calculations  
 * - Component composition with single responsibility
 * - Type-safe interfaces
 * - Minimal cognitive load
 */

import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Star } from "lucide-react";

// Import improved types and utilities
import type {
  ProfileHeaderProps,
  ProcessedUserData,
  AvatarSectionProps,
  UserInfoSectionProps,
  StatsGridSectionProps,
  StatCardProps,
  CompletionRateCardProps,
  ActionButtonsSectionProps,
  ActionButtonProps,
  AchievementBadgesSectionProps,
  AchievementBadgeProps,
  BackgroundEffectsProps,
  StatsCardConfig,
  ActionButtonConfig,
  BadgeConfig
} from "@/types/profile-header.types";

import {
  calculateCompletionRate,
  calculateUserLevel,
  getMemberSinceYear,
  getCurrentStreak,
  shouldShowProBadge,
  getAllAchievementBadges,
  shouldShowAchievements,
  shouldShowProgressPing
} from "@/utils/profile-header-calculations";

import {
  PROFILE_STATS_CARDS,
  ACTION_BUTTONS,
  SPECIAL_BADGES,
  PROGRESS_CONFIG,
  PROFILE_ANIMATION_DURATIONS
} from "@/config/profile-header-config";

/**
 * Helper function to process user data with pure functions
 */
function processUserData(profile: any, stats: any): ProcessedUserData {
  const completionRate = calculateCompletionRate(stats.total_played, stats.backlog);
  const level = calculateUserLevel(stats.total_played);
  
  return {
    displayName: profile.display_name || profile.username,
    username: profile.username,
    avatarUrl: profile.avatar_url,
    avatarInitials: profile.username?.charAt(0).toUpperCase() || 'U',
    memberSinceYear: getMemberSinceYear(profile.created_at),
    level,
    currentStreak: getCurrentStreak(),
    completionRate,
    completionRateNumber: parseInt(completionRate),
    shouldShowPro: shouldShowProBadge(level)
  };
}

/**
 * Helper function to create stats card configurations
 */
function createStatsCards(stats: any): StatsCardConfig[] {
  return [
    {
      ...PROFILE_STATS_CARDS.TOTAL_PLAYED,
      value: stats.total_played
    },
    {
      ...PROFILE_STATS_CARDS.PLAYED_THIS_YEAR,
      value: stats.played_this_year
    },
    {
      ...PROFILE_STATS_CARDS.BACKLOG,
      value: stats.backlog
    }
  ];
}

/**
 * Helper function to create action button configurations
 */
function createActionButtons(onProfileUpdate?: () => void): ActionButtonConfig[] {
  return [
    {
      ...ACTION_BUTTONS.EDIT_PROFILE,
      onClick: onProfileUpdate
    },
    {
      ...ACTION_BUTTONS.ADD_GAME,
      onClick: undefined // TODO: Add game functionality
    },
    {
      ...ACTION_BUTTONS.INVITE_FRIENDS,
      onClick: undefined // TODO: Invite friends functionality
    }
  ];
}

/**
 * Background Effects Component - Pure visual component
 */
const BackgroundEffects = memo(function BackgroundEffects({}: BackgroundEffectsProps) {
  return (
    <>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/15 via-purple-600/8 to-indigo-500/10 backdrop-blur-3xl" />
      <div className="absolute inset-0 rounded-xl border border-purple-400/20 shadow-2xl shadow-purple-500/10" />
      
      {/* Animated background particles effect */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute top-4 right-8 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse" />
        <div className="absolute bottom-6 left-12 w-1 h-1 bg-indigo-400/40 rounded-full animate-pulse delay-300" />
        <div className="absolute top-8 left-1/3 w-1.5 h-1.5 bg-purple-300/25 rounded-full animate-pulse delay-700" />
      </div>
    </>
  );
});

/**
 * Avatar Section - Displays avatar, level badge, and status
 */
const AvatarSection = memo(function AvatarSection({ userData, profile }: AvatarSectionProps) {
  return (
    <div className="relative group">
      {/* Enhanced Avatar Ring with Glow */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-400/40 via-purple-500/30 to-indigo-500/40 opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
      
      {/* Avatar Container */}
      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-purple-400/30 bg-gray-900/40 backdrop-blur-xl shadow-xl">
        <Avatar className="w-full h-full">
          <AvatarImage 
            src={userData.avatarUrl}
            alt={userData.username}
            className="object-cover w-full h-full scale-105 group-hover:scale-110 transition-transform duration-300"
          />
          <AvatarFallback className="bg-gradient-to-br from-purple-600/50 to-indigo-600/50 text-white border-0 text-lg font-bold">
            {userData.avatarInitials}
          </AvatarFallback>
        </Avatar>
        {/* Dynamic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-white/10 opacity-60 rounded-full" />
      </div>
      
      {/* Level Badge with Animation */}
      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center border-2 border-gray-900 group-hover:scale-110 transition-transform duration-200">
        <span className="text-xs font-bold text-white drop-shadow-md">{userData.level}</span>
      </div>
      
      {/* Status indicator */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg animate-pulse" />
    </div>
  );
});

/**
 * User Info Section - Displays name, username, and metadata
 */
const UserInfoSection = memo(function UserInfoSection({ userData, profile }: UserInfoSectionProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-xl font-bold text-white truncate">
          {userData.displayName}
        </h1>
        {userData.shouldShowPro && (
          <Badge className={SPECIAL_BADGES.PRO.className}>
            <SPECIAL_BADGES.PRO.icon className="w-3 h-3 mr-1" />
            {SPECIAL_BADGES.PRO.label}
          </Badge>
        )}
      </div>
      <p className="text-purple-300 text-sm font-medium mb-1">@{userData.username}</p>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Since {userData.memberSinceYear}
        </span>
        <span className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-orange-400" />
          {userData.currentStreak} day streak
        </span>
      </div>
    </div>
  );
});

/**
 * Individual Stat Card Component
 */
const StatCard = memo(function StatCard({ config }: StatCardProps) {
  const Icon = config.icon;
  
  return (
    <div className={`${config.colorScheme.bg} rounded-lg p-3 border ${config.colorScheme.border} transition-colors group`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${config.colorScheme.icon}`} />
        <div className="text-lg font-bold text-white tabular-nums">{config.value}</div>
      </div>
      <div className="text-xs text-gray-400">{config.label}</div>
    </div>
  );
});

/**
 * Completion Rate Card Component - Special stat card with progress bar
 */
const CompletionRateCard = memo(function CompletionRateCard({ 
  completionRate, 
  completionRateNumber,
  shouldShowPing 
}: CompletionRateCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/40 rounded-lg p-3 border border-purple-500/30 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <PROFILE_STATS_CARDS.TOTAL_PLAYED.icon className="w-4 h-4 text-purple-300" />
        <div className="text-lg font-bold text-white tabular-nums">{completionRate}%</div>
      </div>
      <div className="text-xs text-purple-200 mb-2">Completion</div>
      
      {/* Enhanced Progress Bar */}
      <div className="relative">
        <div className={`w-full ${PROGRESS_CONFIG.COLORS.BACKGROUND} rounded-full ${PROGRESS_CONFIG.BAR_HEIGHT} overflow-hidden`}>
          <div 
            className={`h-full ${PROGRESS_CONFIG.COLORS.FILL} rounded-full transition-all duration-${PROFILE_ANIMATION_DURATIONS.PROGRESS_BAR} ease-out relative overflow-hidden`}
            style={{ width: `${Math.min(completionRateNumber, 100)}%` }}
          >
            {/* Animated shine effect */}
            <div className={`absolute inset-0 ${PROGRESS_CONFIG.COLORS.SHINE} animate-pulse`} />
          </div>
        </div>
        {shouldShowPing && (
          <div className="absolute -top-1 right-0 transform translate-x-1/2">
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Stats Grid Section - Displays all stats cards
 */
const StatsGridSection = memo(function StatsGridSection({ 
  stats, 
  completionRate, 
  completionRateNumber 
}: StatsGridSectionProps) {
  const statsCards = createStatsCards(stats);
  const showPing = shouldShowProgressPing(completionRateNumber);

  return (
    <div className="lg:col-span-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Regular Stats Cards */}
        {statsCards.map((config) => (
          <StatCard key={config.key} config={config} />
        ))}
        
        {/* Special Completion Rate Card */}
        <CompletionRateCard 
          completionRate={completionRate}
          completionRateNumber={completionRateNumber}
          shouldShowPing={showPing}
        />
      </div>
    </div>
  );
});

/**
 * Individual Action Button Component
 */
const ActionButton = memo(function ActionButton({ config }: ActionButtonProps) {
  const Icon = config.icon;
  
  return (
    <Button 
      className={config.className}
      size="sm"
      onClick={config.onClick}
      aria-label={config.ariaLabel}
      variant={config.key === 'EDIT_PROFILE' ? 'default' : 'outline'}
    >
      <Icon className={`w-4 h-4 mr-2 ${config.iconAnimation}`} />
      {config.label}
    </Button>
  );
});

/**
 * Action Buttons Section - Displays all action buttons
 */
const ActionButtonsSection = memo(function ActionButtonsSection({ onProfileUpdate }: ActionButtonsSectionProps) {
  const actionButtons = createActionButtons(onProfileUpdate);
  const [editButton, ...otherButtons] = actionButtons;

  return (
    <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2">
      {/* Primary Edit Button */}
      <ActionButton config={editButton} />
      
      {/* Secondary Action Buttons */}
      <div className="flex gap-2 flex-1">
        {otherButtons.map((config) => (
          <ActionButton key={config.key} config={config} />
        ))}
      </div>
    </div>
  );
});

/**
 * Individual Achievement Badge Component
 */
const AchievementBadge = memo(function AchievementBadge({ badge }: AchievementBadgeProps) {
  const Icon = badge.icon;
  
  return (
    <Badge className={badge.className}>
      <Icon className="w-3 h-3 mr-1" />
      {badge.label}
    </Badge>
  );
});

/**
 * Achievement Badges Section - Displays all achievement badges
 */
const AchievementBadgesSection = memo(function AchievementBadgesSection({ 
  badges, 
  shouldShow 
}: AchievementBadgesSectionProps) {
  if (!shouldShow) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-700/30">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 mr-2 flex items-center gap-1">
          <Star className="w-3 h-3" />
          Achievements:
        </span>
        
        {badges.map((badge) => (
          <AchievementBadge key={badge.key} badge={badge} />
        ))}
      </div>
    </div>
  );
});

/**
 * Main ProfileHeader Component - Orchestrates all sub-components
 * Uses improved TypeScript patterns and component composition
 */
export const ProfileHeader = memo(function ProfileHeader({
  profile,
  stats,
  onProfileUpdate,
}: ProfileHeaderProps) {
  // Process user data using pure functions
  const userData = processUserData(profile, stats);
  
  // Calculate achievement badges
  const achievementBadges = getAllAchievementBadges(
    userData.level,
    stats.total_played,
    userData.completionRateNumber,
    userData.currentStreak,
    stats.played_this_year
  );
  
  // Determine if achievements should be shown
  const showAchievements = shouldShowAchievements(
    userData.level,
    stats.total_played,
    userData.completionRateNumber,
    userData.currentStreak
  );

  return (
    <div className="w-full bg-gradient-to-b from-gray-900/30 via-gray-950/50 to-black/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Compact Main Profile Section */}
        <div className="relative">
          <BackgroundEffects />
          
          <div className="relative p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Section: Avatar & Core Info - Compressed */}
              <div className="lg:col-span-4 flex items-center gap-4">
                <AvatarSection userData={userData} profile={profile} />
                <UserInfoSection userData={userData} profile={profile} />
              </div>

              {/* Center Section: Enhanced Stats Grid */}
              <StatsGridSection 
                stats={stats}
                completionRate={userData.completionRate}
                completionRateNumber={userData.completionRateNumber}
              />

              {/* Right Section: Action Buttons */}
              <ActionButtonsSection onProfileUpdate={onProfileUpdate} />
            </div>
            
            {/* Enhanced Achievement Badges Row */}
            <AchievementBadgesSection 
              badges={achievementBadges}
              shouldShow={showAchievements}
            />
          </div>
        </div>
      </div>
    </div>
  );
});