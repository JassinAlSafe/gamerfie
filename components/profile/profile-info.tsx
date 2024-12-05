import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import { Profile } from "@/types/index";
import { updateProfile } from "@/lib/api";

interface ProfileInfoProps {
  profile: Profile;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export function ProfileInfo({ profile, onProfileUpdate }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updates = {
      username: formData.get("username") as string,
      display_name: formData.get("display_name") as string,
      bio: formData.get("bio") as string,
    };

    try {
      const updatedProfile = await updateProfile(profile.id, updates);
      onProfileUpdate(updatedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          Profile Information
        </CardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={profile.username}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={profile.bio} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit">Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Username</h3>
              <p>{profile.username}</p>
            </div>
            <div>
              <h3 className="font-semibold">Display Name</h3>
              <p>{profile.display_name || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Bio</h3>
              <p>{profile.bio || "No bio provided"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
