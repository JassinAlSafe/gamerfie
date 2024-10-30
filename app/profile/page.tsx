"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GamesTab } from "@/components/games-tab";
import { ReviewsTab } from "@/components/reviews-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import {
  X,
  Library,
  Activity,
  Heart,
  Users,
  ScrollText,
  Pencil,
  GamepadIcon,
} from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { AvatarUpload } from "@/components/avatar-upload";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  updated_at?: string;
}

interface GameStats {
  total_played: number;
  played_this_year: number;
  backlog: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    total_played: 0,
    played_this_year: 0,
    backlog: 0,
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get the current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch the profile for the current user
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          toast.error("Failed to fetch profile");
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !profile) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: filePath } : null));
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const updatedProfile = {
      username: formData.get("username") as string,
      display_name: formData.get("display_name") as string,
      bio: formData.get("bio") as string,
    };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", profile?.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : null));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Please sign in or create an account to view your profile.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center space-y-4">
            <AvatarUpload
              userId={profile.id}
              username={profile.username}
              currentAvatarUrl={profile.avatar_url}
              onAvatarUpdate={(url) => {
                setProfile((prev) =>
                  prev ? { ...prev, avatar_url: url } : null
                );
              }}
            />
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                {profile.display_name || profile.username}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-4xl font-bold">
                    {gameStats.total_played}
                  </CardTitle>
                  <CardDescription>Total Games Played</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-4xl font-bold">
                    {gameStats.played_this_year}
                  </CardTitle>
                  <CardDescription>Played in 2024</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-4xl font-bold">
                    {gameStats.backlog}
                  </CardTitle>
                  <CardDescription>Games Backlogged</CardDescription>
                </CardHeader>
              </Card>
            </div>

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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Profile Picture</Label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </div>
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
                      <Input
                        id="bio"
                        name="bio"
                        defaultValue={profile.bio || ""}
                      />
                    </div>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid grid-cols-6 md:w-fit">
            <TabsTrigger value="games">
              <GamepadIcon className="h-4 w-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <ScrollText className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="lists">
              <Library className="h-4 w-4 mr-2" />
              Lists
            </TabsTrigger>
            <TabsTrigger value="friends">
              <Users className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="likes">
              <Heart className="h-4 w-4 mr-2" />
              Likes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="games">
            <GamesTab />
          </TabsContent>
          <TabsContent value="reviews">
            <ReviewsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
