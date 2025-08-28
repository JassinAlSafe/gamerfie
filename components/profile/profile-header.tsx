import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/types/profile";
import { GameStats } from "@/types/user";
import { 
  Edit3, 
  Plus, 
  UserPlus, 
  Trophy, 
  Calendar,
  Target,
  Gamepad2,
  TrendingUp,
  Award,
  Flame,
  Star,
  Crown,
  Zap
} from "lucide-react";

interface ProfileHeaderProps {
  profile: Profile;
  stats: GameStats;
  onProfileUpdate?: () => void;
}


export function ProfileHeader({
  profile,
  stats,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const completionRate = stats.total_played > 0
    ? ((stats.total_played / (stats.total_played + stats.backlog)) * 100).toFixed(0)
    : "0";

  const memberSince = new Date(profile.created_at).getFullYear();
  const currentStreak = Math.floor(Math.random() * 15) + 1; // Placeholder for actual streak logic
  const level = Math.floor(stats.total_played / 10) + 1;

  return (
    <div className="w-full bg-gradient-to-b from-gray-900/30 via-gray-950/50 to-black/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Compact Main Profile Section */}
        <div className="relative">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/15 via-purple-600/8 to-indigo-500/10 backdrop-blur-3xl" />
          <div className="absolute inset-0 rounded-xl border border-purple-400/20 shadow-2xl shadow-purple-500/10" />
          
          {/* Animated background particles effect */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute top-4 right-8 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse" />
            <div className="absolute bottom-6 left-12 w-1 h-1 bg-indigo-400/40 rounded-full animate-pulse delay-300" />
            <div className="absolute top-8 left-1/3 w-1.5 h-1.5 bg-purple-300/25 rounded-full animate-pulse delay-700" />
          </div>
          
          <div className="relative p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Section: Avatar & Core Info - Compressed */}
              <div className="lg:col-span-4 flex items-center gap-4">
                <div className="relative group">
                  {/* Enhanced Avatar Ring with Glow */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-400/40 via-purple-500/30 to-indigo-500/40 opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  
                  {/* Avatar Container */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-purple-400/30 bg-gray-900/40 backdrop-blur-xl shadow-xl">
                    <Avatar className="w-full h-full">
                      <AvatarImage 
                        src={profile.avatar_url || undefined} 
                        alt={profile.username}
                        className="object-cover w-full h-full scale-105 group-hover:scale-110 transition-transform duration-300"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600/50 to-indigo-600/50 text-white border-0 text-lg font-bold">
                        {profile.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Dynamic overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-white/10 opacity-60 rounded-full" />
                  </div>
                  
                  {/* Level Badge with Animation */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center border-2 border-gray-900 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-xs font-bold text-white drop-shadow-md">{level}</span>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg animate-pulse" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-white truncate">
                      {profile.display_name || profile.username}
                    </h1>
                    {level >= 10 && (
                      <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30 px-1.5 py-0.5 text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </div>
                  <p className="text-purple-300 text-sm font-medium mb-1">@{profile.username}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Since {memberSince}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {currentStreak} day streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Section: Enhanced Stats Grid */}
              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Primary Stats with Icons */}
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-lg p-3 border border-gray-700/50 hover:border-purple-500/30 transition-colors group">
                    <div className="flex items-center gap-2 mb-1">
                      <Gamepad2 className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                      <div className="text-lg font-bold text-white tabular-nums">{stats.total_played}</div>
                    </div>
                    <div className="text-xs text-gray-400">Games Played</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-lg p-3 border border-gray-700/50 hover:border-green-500/30 transition-colors group">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                      <div className="text-lg font-bold text-white tabular-nums">{stats.played_this_year}</div>
                    </div>
                    <div className="text-xs text-gray-400">This Year</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-lg p-3 border border-gray-700/50 hover:border-blue-500/30 transition-colors group">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                      <div className="text-lg font-bold text-white tabular-nums">{stats.backlog}</div>
                    </div>
                    <div className="text-xs text-gray-400">Backlog</div>
                  </div>
                  
                  {/* Enhanced Completion Rate */}
                  <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/40 rounded-lg p-3 border border-purple-500/30 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-purple-300" />
                      <div className="text-lg font-bold text-white tabular-nums">{completionRate}%</div>
                    </div>
                    <div className="text-xs text-purple-200 mb-2">Completion</div>
                    
                    {/* Enhanced Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-800/60 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-400 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${Math.min(parseFloat(completionRate), 100)}%` }}
                        >
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                        </div>
                      </div>
                      {parseFloat(completionRate) > 50 && (
                        <div className="absolute -top-1 right-0 transform translate-x-1/2">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section: Action Buttons */}
              <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2">
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-200 group flex-1"
                  size="sm"
                  onClick={onProfileUpdate}
                  aria-label="Edit your profile information"
                >
                  <Edit3 className="w-4 h-4 mr-2 group-hover:rotate-6 transition-transform" />
                  Edit Profile
                </Button>
                
                <div className="flex gap-2 flex-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-gray-800/50 border-gray-600/50 hover:bg-purple-900/30 hover:border-purple-500/50 text-gray-300 hover:text-white transition-all duration-200 group flex-1"
                    aria-label="Add a new game to your collection"
                  >
                    <Plus className="w-4 h-4 mr-1 group-hover:rotate-90 transition-transform" />
                    Add Game
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-gray-800/50 border-gray-600/50 hover:bg-indigo-900/30 hover:border-indigo-500/50 text-gray-300 hover:text-white transition-all duration-200 group flex-1"
                    aria-label="Invite friends to join your gaming network"
                  >
                    <UserPlus className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                    Invite
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Enhanced Achievement Badges Row */}
            {(level >= 3 || stats.total_played >= 10 || parseInt(completionRate) >= 15 || currentStreak >= 3) && (
              <div className="mt-4 pt-4 border-t border-gray-700/30">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 mr-2 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Achievements:
                  </span>
                  
                  {/* Level Badges */}
                  {level >= 20 && (
                    <Badge className="bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-200 border-amber-500/40 text-xs hover:from-amber-500/40 hover:to-yellow-500/40 transition-all duration-200 shadow-lg shadow-amber-500/20">
                      <Crown className="w-3 h-3 mr-1" />
                      Master
                    </Badge>
                  )}
                  {level >= 10 && level < 20 && (
                    <Badge className="bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-200 border-purple-500/40 text-xs hover:from-purple-500/40 hover:to-indigo-500/40 transition-all duration-200">
                      <Zap className="w-3 h-3 mr-1" />
                      Expert
                    </Badge>
                  )}
                  {level >= 5 && level < 10 && (
                    <Badge className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-300 border-yellow-600/30 text-xs hover:from-yellow-600/30 hover:to-orange-600/30 transition-colors">
                      <Trophy className="w-3 h-3 mr-1" />
                      Advanced
                    </Badge>
                  )}
                  {level >= 3 && level < 5 && (
                    <Badge className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border-green-600/30 text-xs hover:from-green-600/30 hover:to-emerald-600/30 transition-colors">
                      <Target className="w-3 h-3 mr-1" />
                      Rising
                    </Badge>
                  )}
                  
                  {/* Gaming Activity Badges */}
                  {stats.total_played >= 100 && (
                    <Badge className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 border-blue-600/30 text-xs hover:from-blue-600/30 hover:to-cyan-600/30 transition-colors">
                      <Gamepad2 className="w-3 h-3 mr-1" />
                      Veteran
                    </Badge>
                  )}
                  {stats.total_played >= 50 && stats.total_played < 100 && (
                    <Badge className="bg-gradient-to-r from-blue-600/15 to-cyan-600/15 text-blue-400 border-blue-600/25 text-xs hover:from-blue-600/25 hover:to-cyan-600/25 transition-colors">
                      <Gamepad2 className="w-3 h-3 mr-1" />
                      Gamer
                    </Badge>
                  )}
                  
                  {/* Completion Badges */}
                  {parseInt(completionRate) >= 75 && (
                    <Badge className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-200 border-purple-600/40 text-xs hover:from-purple-600/40 hover:to-indigo-600/40 transition-all duration-200 shadow-lg shadow-purple-500/20">
                      <Award className="w-3 h-3 mr-1" />
                      Perfectionist
                    </Badge>
                  )}
                  {parseInt(completionRate) >= 50 && parseInt(completionRate) < 75 && (
                    <Badge className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border-purple-600/30 text-xs hover:from-purple-600/30 hover:to-indigo-600/30 transition-colors">
                      <Award className="w-3 h-3 mr-1" />
                      Finisher
                    </Badge>
                  )}
                  {parseInt(completionRate) >= 25 && parseInt(completionRate) < 50 && (
                    <Badge className="bg-gradient-to-r from-purple-600/15 to-indigo-600/15 text-purple-400 border-purple-600/25 text-xs hover:from-purple-600/25 hover:to-indigo-600/25 transition-colors">
                      <Award className="w-3 h-3 mr-1" />
                      Dedicated
                    </Badge>
                  )}
                  
                  {/* Streak Badges */}
                  {currentStreak >= 30 && (
                    <Badge className="bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-200 border-orange-500/40 text-xs hover:from-orange-500/40 hover:to-red-500/40 transition-all duration-200 shadow-lg shadow-orange-500/20">
                      <Flame className="w-3 h-3 mr-1" />
                      Fire Master
                    </Badge>
                  )}
                  {currentStreak >= 14 && currentStreak < 30 && (
                    <Badge className="bg-gradient-to-r from-red-600/20 to-orange-600/20 text-orange-300 border-orange-600/30 text-xs hover:from-red-600/30 hover:to-orange-600/30 transition-colors">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot Streak
                    </Badge>
                  )}
                  {currentStreak >= 7 && currentStreak < 14 && (
                    <Badge className="bg-gradient-to-r from-red-600/15 to-orange-600/15 text-red-400 border-red-600/25 text-xs hover:from-red-600/25 hover:to-orange-600/25 transition-colors">
                      <Flame className="w-3 h-3 mr-1" />
                      On Fire
                    </Badge>
                  )}
                  {currentStreak >= 3 && currentStreak < 7 && (
                    <Badge className="bg-gradient-to-r from-yellow-600/15 to-red-600/15 text-yellow-400 border-yellow-600/25 text-xs hover:from-yellow-600/25 hover:to-red-600/25 transition-colors">
                      <Flame className="w-3 h-3 mr-1" />
                      Consistent
                    </Badge>
                  )}
                  
                  {/* Special Activity Badge */}
                  {stats.played_this_year >= 20 && (
                    <Badge className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-emerald-300 border-emerald-600/30 text-xs hover:from-emerald-600/30 hover:to-green-600/30 transition-colors">
                      <Calendar className="w-3 h-3 mr-1" />
                      Active {new Date().getFullYear()}
                    </Badge>
                  )}
                  
                  {/* View All Achievements Link */}
                  <a
                    href="/achievements"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400 transition-colors cursor-pointer ml-2"
                  >
                    <Trophy className="w-3 h-3" />
                    View All
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
