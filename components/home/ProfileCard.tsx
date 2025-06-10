import type { User } from "@supabase/supabase-js";
import { Users, Trophy, Calendar, Star, TrendingUp, Gamepad2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  return (
    <div className="relative">
      {/* Main profile section - compact and elegant */}
      <Card className="group relative overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card backdrop-blur-sm hover:shadow-xl transition-all duration-500">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-blue-500/3" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Profile Section */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar className="h-14 w-14 ring-2 ring-purple-500/20 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-purple-500/40 group-hover:scale-105">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url} 
                    className="transition-transform duration-300"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold text-lg">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-400 rounded-full border-2 border-background animate-pulse" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent truncate">
                    {user.user_metadata?.display_name || user.email?.split('@')[0] || 'Gamer'}
                  </h2>
                  <Link 
                    href="/profile" 
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 rounded-full hover:bg-purple-400/10 hover:scale-110"
                    title="View Profile"
                  >
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {formatMemberDate(user.created_at || "")}
                </p>
              </div>
            </div>
            
            {/* Quick Stats Summary - Horizontal */}
            <div className="flex gap-4 flex-shrink-0">
              <QuickStat 
                icon={<Trophy className="h-4 w-4" />}
                value={safeStats.completedGames}
                label="Completed"
                color="text-yellow-500"
              />
              <QuickStat 
                icon={<Users className="h-4 w-4" />}
                value={friendsCount}
                label="Friends"
                color="text-blue-500"
              />
              <QuickStat 
                icon={<Gamepad2 className="h-4 w-4" />}
                value={`${safeStats.totalPlaytime}h`}
                label="Hours"
                color="text-green-500"
              />
              <QuickStat 
                icon={<Star className="h-4 w-4" />}
                value={safeStats.averageRating.toFixed(1)}
                label="Rating"
                color="text-purple-500"
              />
            </div>
          </div>
          
          {/* Gaming Progress Bar */}
          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Gaming Progress</span>
              <span>{safeStats.totalGames} total games</span>
            </div>
            <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min((safeStats.completedGames / Math.max(safeStats.totalGames, 1)) * 100, 100)}%` 
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Quick stat component for horizontal layout
const QuickStat = memo(function QuickStat({ 
  icon, 
  value, 
  label, 
  color 
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center text-center group/stat cursor-default">
      <div className={cn(
        "flex items-center justify-center p-2 rounded-lg bg-muted/30 transition-all duration-200 group-hover/stat:scale-110 group-hover/stat:bg-muted/50",
        color
      )}>
        {icon}
      </div>
      <div className="mt-1.5">
        <p className="text-sm font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
});

// Loading skeleton component
const ProfileCardSkeleton = memo(function ProfileCardSkeleton() {
  return (
    <Card className="border-border/40">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="mt-1.5 space-y-1">
                  <Skeleton className="h-3 w-6" />
                  <Skeleton className="h-2 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
});
