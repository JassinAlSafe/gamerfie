
import { Card } from "@/components/ui/card";
import { ProfileTabs } from "./ProfileTabs";

interface ProfileMainContentProps {
  username: string;
}

export function ProfileMainContent({ username }: ProfileMainContentProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">{username}&apos;s Profile</h1>
      </Card>
      <ProfileTabs />
    </div>
  );
}