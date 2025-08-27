import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/types/profile";
import { GameStats } from "@/types/user";
import { User } from "lucide-react";

interface ProfileHeaderProps {
  profile: Profile;
  stats: GameStats;
}


export function ProfileHeader({
  profile,
  stats,
}: ProfileHeaderProps) {
  const completionRate = stats.total_played > 0
    ? ((stats.total_played / (stats.total_played + stats.backlog)) * 100).toFixed(0)
    : "0";

  return (
    <div className="w-full bg-gradient-to-b from-gray-900/20 via-gray-950/40 to-black/60">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main Profile Section */}
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-purple-400/5 backdrop-blur-3xl" />
          <div className="absolute inset-0 rounded-2xl border border-white/10" />
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Avatar & Core Info */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {/* Avatar Ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30 p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-sm" />
                  </div>
                  
                  {/* Avatar Container */}
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border border-white/10 bg-gray-900/30 backdrop-blur-xl">
                    <Avatar className="w-full h-full">
                      <AvatarImage 
                        src={profile.avatar_url || undefined} 
                        alt={profile.username}
                        className="object-cover w-full h-full"
                      />
                      <AvatarFallback className="bg-gray-800/60 text-white border-0">
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    {/* Subtle overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 opacity-60 rounded-full" />
                  </div>
                  
                  {/* Enhanced Level Badge */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/25 flex items-center justify-center border-2 border-gray-900/80">
                    <span className="text-xs font-bold text-white drop-shadow-sm">{Math.floor(stats.total_played / 10) + 1}</span>
                  </div>
                  
                  {/* Hover effect ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400/0 group-hover:border-purple-400/30 transition-all duration-300" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="text-purple-300 text-sm font-medium">@{profile.username}</p>
                  {profile.bio && (
                    <p className="text-gray-400 text-sm mt-2 max-w-md leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 lg:ml-8">
                <div className="grid grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white tabular-nums">{stats.total_played}</div>
                    <div className="text-xs text-gray-400 mt-1">Games</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white tabular-nums">{stats.played_this_year}</div>
                    <div className="text-xs text-gray-400 mt-1">This Year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white tabular-nums">{stats.backlog}</div>
                    <div className="text-xs text-gray-400 mt-1">Backlog</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white tabular-nums">{completionRate}%</div>
                    <div className="text-xs text-gray-400 mt-1">Complete</div>
                    <div className="w-full bg-gray-800/50 rounded-full h-1 mt-2">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(parseFloat(completionRate), 100)}%` }}
                      />
                    </div>
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
