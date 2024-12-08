import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/index";
import { GameStats } from "@/types/index";
import { Pencil, GamepadIcon as GameController, Calendar, Clock, BarChart2 } from 'lucide-react';
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileHeaderProps {
  profile: Profile;
  stats?: GameStats;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export function ProfileHeader({
  profile,
  stats,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const queryClient = useQueryClient();

  // Get the updated stats from the cache
  const cachedStats = queryClient.getQueryData<GameStats>(["userStats", profile.id]) || stats;

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative mb-16">
      <div className="absolute inset-0 h-80 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900" />
      <div className="relative container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex-shrink-0 z-10">
            <AvatarUpload
              userId={profile.id}
              username={profile.username}
              currentAvatarUrl={profile.avatar_url}
              onAvatarUpdate={(url) =>
                onProfileUpdate({ ...profile, avatar_url: url })
              }
            />
          </div>
          <div className="flex-grow min-w-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 shadow-text">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-xl text-gray-300 shadow-text">@{profile.username}</p>
            <p className="mt-4 text-gray-200 max-w-2xl shadow-text">
              {profile.bio || "No bio provided"}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors duration-200 shadow-lg"
            >
              <Pencil className="h-5 w-5 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatItem
                icon={GameController}
                label="Total Played"
                value={cachedStats.total_played || 0}
                color="text-purple-400"
              />
              <StatItem
                icon={Calendar}
                label="Played This Year"
                value={cachedStats.played_this_year || 0}
                color="text-indigo-400"
              />
              <StatItem
                icon={Clock}
                label="Backlog"
                value={cachedStats.backlog || 0}
                color="text-pink-400"
              />
              <StatItem
                icon={BarChart2}
                label="Completion Rate"
                value={
                  cachedStats && cachedStats.total_played > 0
                    ? `${(
                        (cachedStats.total_played /
                          (cachedStats.total_played + cachedStats.backlog)) *
                        100
                      ).toFixed(1)}%`
                    : "0%"
                }
                color="text-green-400"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}function StatItem({ icon: Icon, label, value, color }: StatItemProps) {  return (    <div className="flex items-center space-x-4">      <Icon className={`h-8 w-8 ${color}`} />      <div>        <p className="text-sm text-gray-400">{label}</p>        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

