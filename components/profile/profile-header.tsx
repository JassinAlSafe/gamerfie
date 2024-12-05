import { Card, CardContent } from "@/components/ui/card";
import { AvatarUpload } from "@/components/avatar-upload";
import { updateProfile } from "@/lib/api";
import { Profile } from "@/types/index";
import { toast } from "react-hot-toast";

interface ProfileHeaderProps {
  profile: Profile;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export function ProfileHeader({
  profile,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const handleAvatarUpdate = async (url: string) => {
    try {
      const updatedProfile = await updateProfile(profile.id, {
        avatar_url: url,
      });
      onProfileUpdate(updatedProfile);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.error("Failed to update avatar");
      console.error("Error updating avatar:", error);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <AvatarUpload
            userId={profile.id}
            username={profile.username}
            currentAvatarUrl={profile.avatar_url}
            onAvatarUpdate={handleAvatarUpdate}
          />
          <h2 className="mt-4 text-2xl font-bold">
            {profile.display_name || profile.username}
          </h2>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>
      </CardContent>
    </Card>
  );
}
