/**
 * Improved ProfileCard component following "inevitable" TypeScript patterns
 * - Configuration-driven design
 * - Pure functions for calculations
 * - Component composition with single responsibility
 * - Type-safe discriminated unions
 * - Minimal cognitive load
 */

import { memo } from "react";
import { TrendingUp, Calendar, Settings, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import styles from "./ProfileCard.module.css";

// Import improved types and utilities
import type { 
  ProfileCardProps, 
  UserProfileProps, 
  StatsGridProps, 
  ProgressSectionProps,
  QuickActionsProps,
  EmptyStateProps,
  FriendsData,
  SafeStats
} from "@/types/profile-card.types";
import { 
  calculateCompletionPercentage,
  getActivityLevel,
  getProgressBarColor,
  formatMemberDate,
  getDisplayName,
  getAvatarInitials,
  getRemainingGames
} from "@/utils/profile-calculations";
import { STAT_CARDS, PROGRESS_MILESTONES, ANIMATION_DURATIONS } from "@/config/profile-config";

/**
 * Helper function to get friends count from discriminated union
 */
function getFriendsCount(friends: FriendsData): number {
  return friends.type === 'list' ? friends.items.length : friends.count;
}

/**
 * Helper function to create safe stats with defaults
 */
function createSafeStats(stats?: Partial<SafeStats>): SafeStats {
  return {
    totalGames: stats?.totalGames ?? 0,
    completedGames: stats?.completedGames ?? 0,
    totalPlaytime: stats?.totalPlaytime ?? 0,
    averageRating: stats?.averageRating ?? 0,
  };
}

/**
 * User Profile Section - Displays avatar, name, activity badge, and member info
 */
const UserProfile = memo(function UserProfile({ user, activityBadge }: UserProfileProps) {
  const displayName = getDisplayName(user.email ?? null, user.user_metadata?.display_name ?? null);
  const avatarInitials = getAvatarInitials(user.email ?? null, user.user_metadata?.display_name ?? null);
  const memberSince = formatMemberDate(user.created_at);
  
  const ActivityIcon = activityBadge.icon;

  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      {/* Enhanced Avatar with status */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-14 w-14 ring-2 ring-border/20 ring-offset-2 ring-offset-background">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold text-lg">
            {avatarInitials}
          </AvatarFallback>
        </Avatar>
        {/* Activity indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background animate-pulse ${styles.activityIndicator}`} />
      </div>
      
      {/* Profile Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-foreground truncate">
            {displayName}
          </h2>
          <Badge variant={activityBadge.variant} className="text-xs px-2 py-0.5">
            <ActivityIcon className="h-3 w-3 mr-1" />
            {activityBadge.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Member since {memberSince}
        </p>
      </div>
    </div>
  );
});

/**
 * Quick Actions Section - Provides quick access buttons
 */
const QuickActions = memo(function QuickActions({ className = "" }: QuickActionsProps) {
  return (
    <div className={`flex gap-2 transition-all duration-${ANIMATION_DURATIONS.NORMAL} ${styles.quickActions} ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            asChild
          >
            <Link href="/games">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Games</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            asChild
          >
            <Link href="/profile">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Profile Settings</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});

/**
 * Individual Stat Card - Reusable component for displaying stats
 */
const StatCard = memo(function StatCard({ 
  value, 
  config 
}: { 
  value: number; 
  config: typeof STAT_CARDS[keyof typeof STAT_CARDS];
}) {
  const Icon = config.icon;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`text-center p-3 rounded-lg ${config.colorScheme.bg} ${config.colorScheme.hover} transition-all duration-${ANIMATION_DURATIONS.NORMAL} cursor-default border ${config.colorScheme.border} ${styles.statItem}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon className={`h-4 w-4 ${config.colorScheme.icon}`} />
            <div className="text-xl font-bold text-foreground tabular-nums">{value}</div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">{config.label}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
});

/**
 * Stats Grid Section - Displays all stat cards in a grid
 */
const StatsGrid = memo(function StatsGrid({ stats, friendsCount }: StatsGridProps) {
  return (
    <div className={`grid mb-4 ${styles.statsGrid}`}>
      <StatCard value={stats.totalGames} config={STAT_CARDS.GAMES} />
      <StatCard value={stats.completedGames} config={STAT_CARDS.COMPLETED} />
      <StatCard value={friendsCount} config={STAT_CARDS.FRIENDS} />
    </div>
  );
});

/**
 * Progress Milestone Component - Individual milestone marker
 */
const ProgressMilestone = memo(function ProgressMilestone({ 
  isReached 
}: { 
  milestone: number; 
  isReached: boolean; 
}) {
  return (
    <div
      className={`w-1 h-4 rounded-full transition-colors duration-${ANIMATION_DURATIONS.NORMAL} ${
        isReached ? 'bg-background shadow-sm' : 'bg-muted/50'
      }`}
    />
  );
});

/**
 * Progress Section - Shows completion progress with visual indicators
 */
const ProgressSection = memo(function ProgressSection({ stats, completionPercentage }: ProgressSectionProps) {
  const progressColor = getProgressBarColor(completionPercentage);
  const remainingGames = getRemainingGames(stats.totalGames, stats.completedGames);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground tabular-nums">{completionPercentage}%</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/10"
            asChild
          >
            <Link href="/profile">
              <TrendingUp className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-${ANIMATION_DURATIONS.PROGRESS_BAR} ease-out ${progressColor} ${styles.progressBar}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        {/* Progress milestones */}
        <div className="absolute inset-0 flex justify-between items-center px-1">
          {PROGRESS_MILESTONES.map((milestone) => (
            <ProgressMilestone
              key={milestone}
              milestone={milestone}
              isReached={completionPercentage >= milestone}
            />
          ))}
        </div>
      </div>

      {/* Progress insights */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{stats.completedGames} completed</span>
        <span>{remainingGames} remaining</span>
      </div>
    </div>
  );
});

/**
 * Empty State Section - Encourages users to add their first game
 */
const EmptyState = memo(function EmptyState({}: EmptyStateProps) {
  const GameIcon = STAT_CARDS.GAMES.icon;
  
  return (
    <div className="text-center py-4">
      <GameIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
      <p className="text-sm text-muted-foreground mb-3">Start your gaming journey</p>
      <Button 
        size="sm" 
        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        asChild
      >
        <Link href="/games">
          <Plus className="h-4 w-4" />
          Add Your First Game
        </Link>
      </Button>
    </div>
  );
});

/**
 * Loading Skeleton - Enhanced loading state that matches the new design
 */
const ProfileCardSkeleton = memo(function ProfileCardSkeleton() {
  return (
    <Card className="border-border/30">
      <CardContent className="p-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-shrink-0">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-muted" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-muted/20 space-y-2">
              <div className="flex items-center justify-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-8" />
              </div>
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>

        {/* Progress skeleton */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Main ProfileCard Component - Orchestrates all sub-components
 * Uses improved TypeScript patterns and component composition
 */
export const ProfileCard = memo(function ProfileCard({ 
  user, 
  stats, 
  friends, 
  isLoading = false 
}: ProfileCardProps) {
  // Early return for loading state
  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  // Create safe stats with defaults
  const safeStats = createSafeStats(stats);
  
  // Calculate derived values using pure functions
  const friendsCount = getFriendsCount(friends);
  const completionPercentage = calculateCompletionPercentage(safeStats.completedGames, safeStats.totalGames);
  const activityBadge = getActivityLevel(completionPercentage);
  
  // Determine if user has games
  const hasGames = safeStats.totalGames > 0;

  return (
    <TooltipProvider>
      <div className={`relative ${styles.profileCard}`}>
        <Card className="group relative border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm hover:shadow-lg hover:border-border/50 transition-all duration-300 overflow-hidden">
          
          {/* Gaming-themed background pattern */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
          
          <CardContent className="p-6 relative">
            {/* Header with Avatar and Quick Actions */}
            <div className="flex items-start justify-between mb-4">
              <UserProfile user={user} activityBadge={activityBadge} />
              <QuickActions />
            </div>

            {/* Stats Grid */}
            <StatsGrid stats={safeStats} friendsCount={friendsCount} />

            {/* Conditional Content - Progress or Empty State */}
            {hasGames ? (
              <ProgressSection stats={safeStats} completionPercentage={completionPercentage} />
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});