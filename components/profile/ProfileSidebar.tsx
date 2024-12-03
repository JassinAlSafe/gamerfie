import { AvatarUpload } from "@/components/avatar-upload";
import { Profile } from "@/types/index";

interface ProfileSidebarProps {
  profile: Profile;
  onAvatarUpdate: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileSidebar({
  profile,
  onAvatarUpdate,
}: ProfileSidebarProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <AvatarUpload
        userId={profile.id}
        username={profile.username}
        currentAvatarUrl={profile.avatar_url}
        onAvatarUpdate={onAvatarUpdate}
      />
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {profile.display_name || profile.username}
        </h2>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>
      </div>
    </div>
  );
}
