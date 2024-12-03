"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GamesTab } from "@/components/games-tab";
import { ReviewsTab } from "@/components/reviews-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { X, Library, Activity, Heart, Users, ScrollText, Pencil, GamepadIcon } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { AvatarUpload } from "@/components/avatar-upload";
import { useProfile } from "@/app/hooks/use-profile";
import { ProfileStats } from "@/components/profile-stats";
import { QueryClient, QueryClientProvider } from "react-query";
import { Game } from "@/types/game";

const queryClient = new QueryClient();

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { profile, isLoading, updateProfile, updateGameStats } = useProfile();

  const supabase = createClientComponentClient();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !profile) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      await updateProfile({ avatar_url: filePath });
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      await updateProfile({
        username: formData.get("username") as string,
        display_name: formData.get("display_name") as string,
        bio: formData.get("bio") as string,
      });
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGamesUpdate = (games: Game[]) => {
    const processedGames = games.map(game => ({
      ...game,
      cover: game.cover || undefined
    }));
    updateGameStats(processedGames);
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
            <CardDescription>Please sign in or create an account to view your profile.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <Button asChild><Link href="/signin">Sign In</Link></Button>
            <Button asChild variant="outline"><Link href="/signup">Sign Up</Link></Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="min-h-screen bg-background p-4 md:p-8">
          <Toaster position="top-center" />
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left column - Avatar and basic info */}
              <div className="flex flex-col items-center space-y-4">
                <AvatarUpload
                  userId={profile.id}
                  username={profile.username}
                  currentAvatarUrl={profile.avatar_url}
                  onAvatarUpdate={(url) => updateProfile({ avatar_url: url })}
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

              {/* Right column - Stats and Bio */}
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
                <GamesTab onGamesUpdate={handleGamesUpdate} />
              </TabsContent>
              <TabsContent value="reviews">
                <ReviewsTab />
              </TabsContent>
              {/* Add other TabsContent components for remaining tabs */}
            </Tabs>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}