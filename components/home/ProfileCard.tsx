import { User } from "@supabase/auth-helpers-nextjs";
import {
  Medal,
  Star,
  Calendar,
  Gamepad2,
  Users2,
  Trophy,
  Target,
  Flame,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useProfile } from "@/hooks/use-profile";

interface ProfileCardProps {
  user: User;
  stats: {
    totalGames: number;
    totalPlaytime: number;
  };
  friends: number;
}

export function ProfileCard({ user, stats, friends }: ProfileCardProps) {
  const { profile, isLoading } = useProfile();

  const username = profile?.display_name || profile?.username || "Gamer";
  const level = Math.floor(stats.totalPlaytime / 600);
  const nextLevelProgress = ((stats.totalPlaytime % 600) / 600) * 100;
  const joinDateString = profile?.created_at || new Date().toISOString();
  const joinDate = new Date(joinDateString);
  const joinedText = profile?.created_at
    ? `Joined ${formatDistanceToNow(joinDate)} ago`
    : "New Player";

  if (isLoading) {
    return (
      <div className="relative mt-8 px-6">
        <div className="animate-pulse">
          <div className="h-[200px] bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-8 px-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.08)_0%,transparent_65%)]" />

      <div className="relative rounded-xl border border-purple-200/10 bg-background/80 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Top Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.05)_25%,rgba(147,51,234,0.05)_50%,transparent_50%,transparent_75%,rgba(147,51,234,0.05)_75%)] bg-[length:8px_8px]" />

        {/* Glow Effects */}
        <div className="absolute -left-32 -top-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -right-32 -bottom-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative p-8">
          <div className="flex items-start gap-8">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full blur opacity-40" />
              <Avatar className="relative h-24 w-24 ring-4 ring-purple-500/20 ring-offset-4 ring-offset-background transition-all duration-300 hover:ring-purple-500/30 hover:ring-offset-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-2xl">
                  {username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 border border-purple-200/10 shadow-xl">
                <Medal className="h-5 w-5 text-purple-500" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1.5">
                  <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                    {username}
                  </h1>
                  {profile?.username && (
                    <p className="text-muted-foreground">@{profile.username}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <p className="text-muted-foreground flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-full">
                      <Star className="h-4 w-4 text-purple-500" />
                      Level {level} Gamer
                    </p>
                    <span className="text-muted-foreground/40">•</span>
                    <p className="text-muted-foreground flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      {joinedText}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-500 font-medium border border-purple-500/10 shadow-xl hover:from-purple-500/20 hover:to-indigo-500/20 transition-colors">
                    {Math.round(stats.totalPlaytime / 60)}h played
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="group space-y-2 bg-purple-500/5 p-3 rounded-xl border border-purple-500/10 hover:bg-purple-500/10 transition-colors">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Gamepad2 className="h-4 w-4 text-purple-500" />
                    <span>Games</span>
                  </div>
                  <p className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                    {stats.totalGames}
                  </p>
                </div>
                <div className="group space-y-2 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users2 className="h-4 w-4 text-indigo-500" />
                    <span>Friends</span>
                  </div>
                  <p className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                    {friends}
                  </p>
                </div>
                <div className="group space-y-2 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>Achievements</span>
                  </div>
                  <p className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                    142
                  </p>
                </div>
                <div className="group space-y-2 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 hover:bg-rose-500/10 transition-colors">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Target className="h-4 w-4 text-rose-500" />
                    <span>Completion</span>
                  </div>
                  <p className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                    78%
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-xl p-4 border border-purple-500/10">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground font-medium">
                      Level {level} → {level + 1}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-medium bg-orange-500/10 px-2 py-0.5 rounded-full text-xs">
                    {nextLevelProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 p-[2px] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 ease-in-out"
                    style={{ width: `${nextLevelProgress}%` }}
                  >
                    <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%)] bg-[length:4px_4px] animate-[progress_15s_linear_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
