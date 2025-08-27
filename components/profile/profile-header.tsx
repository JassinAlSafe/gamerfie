import { Card, CardContent } from "@/components/ui/card";
import { AvatarUpload } from "@/components/avatar-upload";
import { Profile } from "@/types/profile";
import { GameStats } from "@/types/user";
import {
  Trophy,
  GamepadIcon as GameController,
  Calendar,
  Clock,
  BarChart2,
  Star,
} from "lucide-react";

interface ProfileHeaderProps {
  profile: Profile;
  stats: GameStats;
  onProfileUpdate: (_updates: Partial<Profile>) => void;
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  progressBgColor: string;
  subtext?: string;
  progress?: number;
}

function StatItem({ icon: Icon, label, value, color, bgColor, progressBgColor, subtext, progress }: StatItemProps) {
  return (
    <div className="group p-4 sm:p-5 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300 border border-gray-700/30 hover:border-gray-600/50">
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-3 sm:space-y-0 sm:space-x-3">
        <div className={`${bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-1 group-hover:text-purple-300 transition-colors">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
          {typeof progress === 'number' && progress >= 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${progressBgColor}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfileHeader({
  profile,
  stats,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const completionRate =
    stats.total_played > 0
      ? `${(
          (stats.total_played / (stats.total_played + stats.backlog)) *
          100
        ).toFixed(1)}%`
      : "0%";

  return (
    <div className="w-full">
      {/* Background with enhanced gradient overlay */}
      <div className="absolute inset-0 h-[280px]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/80 to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        {/* Animated background particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/40 rounded-full animate-pulse" />
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400/60 rounded-full animate-ping" />
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-pulse delay-700" />
        </div>
      </div>

      {/* Profile Content */}
      <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar Section */}
          <div className="relative">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-purple-500/30 shadow-2xl group">
              <AvatarUpload
                userId={profile.id}
                username={profile.username}
                currentAvatarUrl={profile.avatar_url || null}
                onAvatarUpdate={(url) =>
                  onProfileUpdate({ ...profile, avatar_url: url })
                }
              />
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-colors duration-200 rounded-full" />
            </div>
            <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2.5 shadow-lg border-2 border-gray-900">
              <Trophy className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-grow w-full md:w-auto text-center md:text-left">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-lg md:text-xl text-purple-300 font-medium tracking-wide">@{profile.username}</p>
              <p className="text-gray-300 max-w-2xl mx-auto md:mx-0 mt-4 text-sm md:text-base leading-relaxed px-4 md:px-0">
                {profile.bio || "No bio provided yet. Click 'Edit Profile' to add a bio and showcase your gaming personality!"}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-6">
              <div className="flex items-center space-x-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
                <GameController className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 font-medium">
                  {stats.total_played} Games Played
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300 font-medium">
                  Level {Math.floor(stats.total_played / 10) + 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-8">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mx-auto max-w-6xl">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatItem
                  icon={GameController}
                  label="Total Games"
                  value={stats.total_played}
                  color="text-purple-400"
                  bgColor="bg-purple-500/20"
                  progressBgColor="bg-purple-400"
                  subtext="Games in your collection"
                />
                <StatItem
                  icon={Calendar}
                  label="This Year"
                  value={stats.played_this_year}
                  color="text-blue-400"
                  bgColor="bg-blue-500/20"
                  progressBgColor="bg-blue-400"
                  subtext={`${new Date().getFullYear()} progress`}
                  progress={stats.total_played > 0 ? (stats.played_this_year / stats.total_played) * 100 : 0}
                />
                <StatItem
                  icon={Clock}
                  label="Backlog"
                  value={stats.backlog}
                  color="text-pink-400"
                  bgColor="bg-pink-500/20"
                  progressBgColor="bg-pink-400"
                  subtext="Games to play"
                />
                <StatItem
                  icon={BarChart2}
                  label="Completion Rate"
                  value={completionRate}
                  color="text-green-400"
                  bgColor="bg-green-500/20"
                  progressBgColor="bg-green-400"
                  subtext="Of total collection"
                  progress={parseFloat(completionRate.replace('%', ''))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
