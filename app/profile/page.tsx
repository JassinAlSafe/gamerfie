"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GamesTab } from "@/components/games-tab";
import { ReviewsTab } from "@/components/reviews-tab";
import { AvatarUpload } from "@/components/avatar-upload";
import { ProfileStats } from "@/components/profile-stats";
import { useProfile } from "@/app/hooks/use-profile";
import { Game } from "@/types/game";
import toast from "react-hot-toast";
import {
  Activity,
  Heart,
  Library,
  GamepadIcon,
  ScrollText,
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

// Fallback UI for error boundary
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-800">Something went wrong:</p>
      <pre className="text-sm text-red-600">{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const { profile, isLoading, updateProfile, gameStats, updateGameHeart } = useProfile();

  const supabase = createClientComponentClient();

  // Handle avatar upload
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

      await updateProfile({ avatar_url: filePath });
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  // Handle game updates
  const handleGamesUpdate = (games: Game[]) => {
    updateGameStats(games);
  };

  // Handle hearting/unhearting games
  const handleHeartGame = async (gameId: string) => {
    if (!profile) return;
    await updateGameHeart(gameId, true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-primary">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Profile not found. Please sign in.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Profile Header Section */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <AvatarUpload
              userId={profile.id}
              username={profile.username}
              currentAvatarUrl={profile.avatar_url || null} // Ensure null is passed instead of undefined
              onAvatarUpdate={handleAvatarUpload}
            />
            <ProfileStats
              totalPlayed={gameStats.total_played}
              playedThisYear={gameStats.played_this_year}
              backlog={gameStats.backlog}
            />
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="games">
                <GamepadIcon className="mr-2 h-4 w-4" />
                Games
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <ScrollText className="mr-2 h-4 w-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="likes">
                <Heart className="mr-2 h-4 w-4" />
                Likes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="games">
              <GamesTab
                userId={profile.id}
                onGamesUpdate={handleGamesUpdate}
                onHeartGame={handleHeartGame}
              />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
}
