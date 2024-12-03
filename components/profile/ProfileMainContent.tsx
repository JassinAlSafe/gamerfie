import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { X, Pencil } from "lucide-react";
import { Profile } from "@/types";
import { ProfileStats } from "@/components/profile-stats";

interface ProfileMainContentProps {
  profile: Profile;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isUpdating: boolean;
}

export function ProfileMainContent({
  profile,
  isEditing,
  setIsEditing,
  onSubmit,
  isUpdating,
}: ProfileMainContentProps) {
  return (
    <div className="flex-1 space-y-6">
      <ProfileStats />

      {!isEditing ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Bio</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {profile.bio || "No bio provided"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Edit Profile</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={profile.username}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  defaultValue={profile.display_name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" name="bio" defaultValue={profile.bio || ""} />
              </div>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
