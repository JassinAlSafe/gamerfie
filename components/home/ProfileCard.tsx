import type { User } from "@supabase/supabase-js";
import { Calendar, TrendingUp } from "lucide-react";
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
      {/* Main profile section - clean and content-focused */}
      <Card className="group relative border-border/20 bg-card/50 hover:shadow-sm transition-all duration-200">
        
        <CardContent className="px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Profile Section */}
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-muted text-foreground font-medium text-lg">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-semibold text-foreground truncate">
                    {user.user_metadata?.display_name || user.email?.split('@')[0] || 'Gamer'}
                  </h2>
                  <Link 
                    href="/profile" 
                    className="opacity-60 hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted/50"
                    title="View Profile"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {formatMemberDate(user.created_at || "")}
                </p>
              </div>
            </div>
            
            {/* Key Stats - Simplified */}
            <div className="flex gap-8 flex-shrink-0">
              <div className="text-right">
                <div className="text-xl font-semibold text-foreground">{safeStats.totalGames}</div>
                <div className="text-sm text-muted-foreground">Games</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-foreground">{safeStats.completedGames}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-foreground">{friendsCount}</div>
                <div className="text-sm text-muted-foreground">Friends</div>
              </div>
            </div>
          </div>
          
          {/* Simplified Progress */}
          {safeStats.totalGames > 0 && (
            <div className="mt-6 pt-4 border-t border-border/20">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Completion Progress</span>
                <span>{Math.round((safeStats.completedGames / safeStats.totalGames) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground/60 rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${Math.min((safeStats.completedGames / Math.max(safeStats.totalGames, 1)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});


// Loading skeleton component
const ProfileCardSkeleton = memo(function ProfileCardSkeleton() {
  return (
    <Card className="border-border/20">
      <CardContent className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-right space-y-1">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border/20 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
});
