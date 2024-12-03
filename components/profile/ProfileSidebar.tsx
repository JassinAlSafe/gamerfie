
import { AvatarUpload } from "@/components/avatar-upload";
import { Card } from "@/components/ui/card";
import { ProfileStats } from "@/types";

interface ProfileSidebarProps {
  userId: string;
  username: string;
  avatarUrl: string | null;
  stats: ProfileStats;
  onAvatarUpdate: (url: string) => void;
}

export function ProfileSidebar({
  userId,
  username,
  avatarUrl,
  stats,
  onAvatarUpdate,
}: ProfileSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <AvatarUpload
          userId={userId}
          username={username}
          currentAvatarUrl={avatarUrl}
          onAvatarUpdate={onAvatarUpdate}
        />
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Gaming Stats</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Games</span>
            <span>{stats.totalGames}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reviews</span>
            <span>{stats.totalReviews}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed</span>
            <span>{stats.completedGames}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}