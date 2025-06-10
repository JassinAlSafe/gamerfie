import type { User } from "@supabase/supabase-js";
import { Users, Trophy, Calendar, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function ProfileCard({ user, stats, friends }: ProfileCardProps) {
  // Ensure stats has default values
  const safeStats = {
    totalGames: stats?.totalGames || 0,
    completedGames: stats?.completedGames || 0,
    totalPlaytime: stats?.totalPlaytime || 0,
    averageRating: stats?.averageRating || 0,
  };

  // Handle friends being either array or number
  const friendsCount = Array.isArray(friends) ? friends.length : friends;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">
              {user.user_metadata?.display_name || user.email}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Member since {formatMemberDate(user.created_at || "")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">
              {safeStats.completedGames} completed
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{friendsCount} friends</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-green-500" />
            <span className="text-sm">{safeStats.totalPlaytime}h played</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-purple-500" />
            <span className="text-sm">
              {safeStats.averageRating.toFixed(1)} avg rating
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
