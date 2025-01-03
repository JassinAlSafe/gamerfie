"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { Plus } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeSection } from "@/components/Challenges/ChallengeSection";
import { ChallengeGrid } from "@/components/Challenges/ChallengeGrid";
import type { ChallengeStatus } from "@/types/challenge";
import Link from "next/link";

type ValidChallengeStatus = Extract<
  ChallengeStatus,
  "active" | "upcoming" | "completed"
>;

export default function UserChallengesPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const {
    isLoading,
    fetchChallenges,
    getActiveChallenges,
    getUpcomingChallenges,
    getCompletedChallenges,
    getAllChallenges,
  } = useChallengesStore();

  useEffect(() => {
    // Fetch challenges only once
    fetchChallenges(supabase);

    // Set up interval to refresh challenges
    const interval = setInterval(() => {
      fetchChallenges(supabase);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [fetchChallenges, supabase]);

  const handleCreateChallenge = () => {
    router.push("/challenges/create");
  };

  const handleChallengeClick = (challengeId: string) => {
    router.push(`/profile/challenges/${challengeId}`);
  };

  const renderChallengeSection = (status: ValidChallengeStatus) => {
    let challenges = [];
    switch (status) {
      case "active":
        challenges = getActiveChallenges();
        break;
      case "upcoming":
        challenges = getUpcomingChallenges();
        break;
      case "completed":
        challenges = getCompletedChallenges();
        break;
    }

    return (
      <ChallengeSection
        key={status}
        status={status}
        challenges={challenges}
        onChallengeClick={handleChallengeClick}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-background to-background/50 -z-10" />

      <div className="mx-auto max-w-7xl p-6 relative flex flex-col h-screen">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6">
          <div className="space-y-2">
            <TextGenerateEffect
              words="Gaming Challenges"
              className="text-4xl font-bold"
            />
            <p className="text-sm text-muted-foreground/80">
              Discover and track gaming challenges
            </p>
          </div>
          <Link href="/profile/challenges/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <Tabs defaultValue="yours" className="flex-1 flex flex-col">
            <TabsList className="w-full grid grid-cols-2 mb-8">
              <TabsTrigger value="yours" className="text-base">
                Your Challenges
              </TabsTrigger>
              <TabsTrigger value="all" className="text-base">
                Browse Challenges
              </TabsTrigger>
            </TabsList>
            <TabsContent value="yours" className="flex-1 relative">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-12 pb-8">
                  {renderChallengeSection("active")}
                  {renderChallengeSection("upcoming")}
                  {renderChallengeSection("completed")}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="all" className="flex-1 relative">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="pb-8">
                  <ChallengeGrid
                    challenges={getAllChallenges()}
                    onChallengeClick={handleChallengeClick}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
