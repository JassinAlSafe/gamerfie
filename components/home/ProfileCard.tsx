import type { User } from "@supabase/supabase-js";
import { 
  TrendingUp, 
  Trophy, 
  Users, 
  Gamepad2, 
  Star, 
  Calendar,
  Settings,
  Plus,
  Zap,
  Target,
  Award
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { memo } from "react";
import Link from "next/link";
import styles from "./ProfileCard.module.css";

interface ProfileStats {
  totalGames: number;
  completedGames?: number;
  totalPlaytime: number;
  averageRating?: number;
}

interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
}

interface ProfileCardProps {
  user: User;
  stats?: ProfileStats;
  friends: Friend[] | number;
  isLoading?: boolean;
}

// Helper function to format date consistently between server and client
function formatMemberDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Use a consistent format that works the same on server and client
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}/${year}`;
  } catch {
    return "Unknown";
  }
}

export const ProfileCard = memo(function ProfileCard({ 
  user, 
  stats, 
  friends, 
  isLoading = false 
}: ProfileCardProps) {
  // Ensure stats has default values
  const safeStats = {
    totalGames: stats?.totalGames || 0,
    completedGames: stats?.completedGames || 0,
    totalPlaytime: stats?.totalPlaytime || 0,
    averageRating: stats?.averageRating || 0,
  };

  // Handle friends being either array or number
  const friendsCount = Array.isArray(friends) ? friends.length : friends;

  // Calculate completion percentage
  const completionPercentage = safeStats.totalGames > 0 
    ? Math.round((safeStats.completedGames / safeStats.totalGames) * 100)
    : 0;

  // Determine progress bar style based on completion level
  const getProgressBarStyle = (percentage: number) => {
    if (percentage >= 75) return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (percentage >= 50) return "bg-gradient-to-r from-blue-500 to-cyan-600";
    if (percentage >= 25) return "bg-gradient-to-r from-yellow-500 to-orange-600";
    return "bg-gradient-to-r from-purple-500 to-violet-600";
  };

  // Activity status indicator
  const getActivityBadge = () => {
    if (completionPercentage >= 80) return { text: "Expert", variant: "default" as const, icon: Award };
    if (completionPercentage >= 60) return { text: "Active", variant: "secondary" as const, icon: Zap };
    if (completionPercentage >= 30) return { text: "Rising", variant: "outline" as const, icon: Target };
    return { text: "Starter", variant: "outline" as const, icon: Star };
  };

  const activityBadge = getActivityBadge();
  const ActivityIcon = activityBadge.icon;

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className={`relative ${styles.profileCard}`}>
        <Card className="group relative border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm hover:shadow-lg hover:border-border/50 transition-all duration-300 overflow-hidden">
          
          {/* Gaming-themed background pattern */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
          
          <CardContent className="p-6 relative">
            {/* Header with Avatar and Quick Actions */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Enhanced Avatar with status */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-14 w-14 ring-2 ring-border/20 ring-offset-2 ring-offset-background">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Activity indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background animate-pulse ${styles.activityIndicator}`} />
                </div>
                
                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-foreground truncate">
                      {user.user_metadata?.display_name || user.email?.split('@')[0] || 'Gamer'}
                    </h2>
                    <Badge variant={activityBadge.variant} className="text-xs px-2 py-0.5">
                      <ActivityIcon className="h-3 w-3 mr-1" />
                      {activityBadge.text}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since {formatMemberDate(user.created_at || "")}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className={`flex gap-2 transition-all duration-300 ${styles.quickActions}`}>
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
            </div>

            {/* Enhanced Stats Grid */}
            <div className={`grid mb-4 ${styles.statsGrid}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 transition-all duration-300 cursor-default border border-blue-500/20 ${styles.statItem}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Gamepad2 className="h-4 w-4 text-blue-500" />
                      <div className="text-xl font-bold text-foreground tabular-nums">{safeStats.totalGames}</div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Games</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total games in your library</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 hover:from-green-500/20 hover:to-green-600/10 transition-all duration-300 cursor-default border border-green-500/20 ${styles.statItem}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="h-4 w-4 text-green-500" />
                      <div className="text-xl font-bold text-foreground tabular-nums">{safeStats.completedGames}</div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Completed</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Games you've completed</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`text-center p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 transition-all duration-300 cursor-default border border-purple-500/20 ${styles.statItem}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-purple-500" />
                      <div className="text-xl font-bold text-foreground tabular-nums">{friendsCount}</div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Friends</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gaming friends connected</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Enhanced Progress Section */}
            {safeStats.totalGames > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
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
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarStyle(completionPercentage)} ${styles.progressBar}`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  
                  {/* Progress milestones */}
                  <div className="absolute inset-0 flex justify-between items-center px-1">
                    {[25, 50, 75].map((milestone) => (
                      <div
                        key={milestone}
                        className={`w-1 h-4 rounded-full transition-colors duration-300 ${
                          completionPercentage >= milestone 
                            ? 'bg-background shadow-sm' 
                            : 'bg-muted/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress insights */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{safeStats.completedGames} completed</span>
                  <span>{safeStats.totalGames - safeStats.completedGames} remaining</span>
                </div>
              </div>
            )}

            {/* No games state */}
            {safeStats.totalGames === 0 && (
              <div className="text-center py-4">
                <Gamepad2 className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
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
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});


// Loading skeleton component - matches enhanced design
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
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Progress skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-6 w-6" />
            </div>
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
