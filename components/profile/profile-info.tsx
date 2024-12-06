import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { Profile } from "@/types/index";

interface ProfileInfoProps {
  profile: Profile;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export function ProfileInfo({
  profile,
  isEditing,
  setIsEditing,
  onProfileUpdate,
}: ProfileInfoProps) {
  const [formData, setFormData] = useState({
    username: profile.username,
    display_name: profile.display_name || "",
    bio: profile.bio || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onProfileUpdate({ ...profile, ...formData });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-white">
          Profile Information
        </CardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white"
          >
            <Pencil className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-gray-300">
                Display Name
              </Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="text-gray-300 border-gray-700 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white">Username</h3>
              <p>{profile.username}</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Display Name</h3>
              <p>{profile.display_name || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Bio</h3>
              <p>{profile.bio || "No bio provided"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
