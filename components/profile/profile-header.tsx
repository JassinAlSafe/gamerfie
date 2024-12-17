import { Card, CardContent } from "@/components/ui/card";
import { AvatarUpload } from "@/components/avatar-upload";
import { Profile, GameStats } from "@/types/user";
import { 
  Trophy, 
  GamepadIcon as GameController, 
  Calendar, 
  Clock, 
  BarChart2,
  Star 
} from 'lucide-react';

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
  subtext?: string;
}

function StatItem({ icon: Icon, label, value, color, subtext }: StatItemProps) {
  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors duration-200">
      <div className={`${color} p-3 rounded-lg bg-opacity-10 backdrop-blur-sm`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

export function ProfileHeader({ profile, stats, onProfileUpdate }: ProfileHeaderProps) {
  const completionRate = stats.total_played > 0
    ? `${((stats.total_played / (stats.total_played + stats.backlog)) * 100).toFixed(1)}%`
    : "0%";

  return (
    <div className="w-full">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 h-[250px]">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 via-gray-900/95 to-gray-900" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      </div>

      {/* Profile Content */}
      <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-8">
        <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar Section */}
          <div className="relative">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-purple-500/30 shadow-xl">
              <AvatarUpload
                userId={profile.id}
                username={profile.username}
                currentAvatarUrl={profile.avatar_url}
                onAvatarUpdate={(url) => onProfileUpdate({ ...profile, avatar_url: url })}
              />
            </div>
            <div className="absolute -bottom-2 right-0 bg-purple-500 rounded-full p-2 shadow-lg">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-grow">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-xl text-purple-300">@{profile.username}</p>
              <p className="text-gray-300 max-w-2xl mt-4">
                {profile.bio || "No bio provided yet"}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <GameController className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">{stats.total_played} Games Played</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Level {Math.floor(stats.total_played / 10) + 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatItem
                  icon={GameController}
                  label="Total Games"
                  value={stats.total_played}
                  color="bg-purple-500"
                  subtext="Games in your collection"
                />
                <StatItem
                  icon={Calendar}
                  label="This Year"
                  value={stats.played_this_year}
                  color="bg-blue-500"
                  subtext={`${new Date().getFullYear()} progress`}
                />
                <StatItem
                  icon={Clock}
                  label="Backlog"
                  value={stats.backlog}
                  color="bg-pink-500"
                  subtext="Games to play"
                />
                <StatItem
                  icon={BarChart2}
                  label="Completion Rate"
                  value={completionRate}
                  color="bg-green-500"
                  subtext="Of total collection"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

