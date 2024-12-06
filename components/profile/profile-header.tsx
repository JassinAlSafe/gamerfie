import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/index";
import { GameStats } from "@/types/index";
import { Pencil } from "lucide-react";
import { useState } from "react";


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
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 h-64 bg-gradient-to-r from-[#5b21b6] to-[#1e40af]" />
      <div className="relative container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
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
            <h1 className="text-4xl font-bold text-white mb-2">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-xl text-gray-300">@{profile.username}</p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors duration-200"
            >
              <Pencil className="h-5 w-5 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#0f1116] border-gray-800/50 text-white col-span-2">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">About Me</h3>
              <p className="text-gray-300">
                {profile.bio || "No bio provided"}
              </p>
            </CardContent>
          </Card>

          {stats && (
            <Card className="bg-[#0f1116] border-gray-800/50 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Played</p>
                    <p className="text-4xl font-bold text-purple-500">
                      {stats.total_played}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Played This Year</p>
                    <p className="text-4xl font-bold text-indigo-500">
                      {stats.played_this_year}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Backlog</p>
                    <p className="text-4xl font-bold text-pink-500">
                      {stats.backlog}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Completion Rate</p>
                    <p className="text-4xl font-bold text-green-500">
                      {stats.total_played > 0
                        ? `${(
                            (stats.total_played /
                              (stats.total_played + stats.backlog)) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
