"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { Plus } from "lucide-react";
import { ChallengeCard } from "@/components/ui/challenge-card";
import { Challenge, ChallengeStatus } from "@/types/challenge";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ValidChallengeStatus = Extract<
  ChallengeStatus,
  "active" | "upcoming" | "completed"
>;

type GroupedChallenges = Record<ValidChallengeStatus, Challenge[]>;

type ChallengeParticipant = {
  user?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
};

export default function UserChallengesPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const {
    activeChallenges,
    upcomingChallenges,
    completedChallenges,
    allChallenges,
    isLoading,
    fetchChallenges,
    fetchActiveChallenges,
    fetchUpcomingChallenges,
    fetchAllChallenges,
  } = useChallengesStore();

  useEffect(() => {
    // Fetch all challenges initially
    fetchChallenges(supabase);
    fetchAllChallenges(supabase);

    // Set up interval to fetch active and upcoming challenges
    const interval = setInterval(() => {
      fetchActiveChallenges(supabase);
      fetchUpcomingChallenges(supabase);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [
    fetchChallenges,
    fetchActiveChallenges,
    fetchUpcomingChallenges,
    fetchAllChallenges,
    supabase,
  ]);

  const handleCreateChallenge = () => {
    router.push("/challenges/create");
  };

  const groupedChallenges: GroupedChallenges = {
    active: activeChallenges,
    upcoming: upcomingChallenges,
    completed: completedChallenges,
  };

  const getActionProps = (challenge: Challenge) => {
    const status = challenge.status as ValidChallengeStatus;
    return {
      onAction: () => router.push(`/challenges/${challenge.id}`),
    };
  };

  const renderChallengeSection = (status: ValidChallengeStatus) => {
    const challenges = groupedChallenges[status]?.filter(Boolean) || [];
    if (!challenges?.length) return null;

    const sectionTitles = {
      active: "Active Challenges",
      upcoming: "Upcoming Adventures",
      completed: "Past Victories",
    };

    const sectionGradients = {
      active: "from-emerald-500 to-emerald-700",
      upcoming: "from-amber-500 to-amber-700",
      completed: "from-blue-500 to-blue-700",
    };

    return (
      <section key={status} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className={cn(
                "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                sectionGradients[status]
              )}
            >
              {sectionTitles[status]}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {status === "active"
                ? "Your ongoing gaming challenges"
                : status === "upcoming"
                ? "Challenges starting soon"
                : "Completed challenges and achievements"}
            </p>
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              status === "active"
                ? "bg-emerald-500/10 text-emerald-500"
                : status === "upcoming"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-blue-500/10 text-blue-500"
            )}
          >
            {challenges.length}{" "}
            {challenges.length === 1 ? "Challenge" : "Challenges"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => {
            if (!challenge?.id) return null;
            return (
              <ChallengeCard
                key={challenge.id}
                title={challenge.title || "Untitled Challenge"}
                description={
                  challenge.description || "No description available"
                }
                organizer={{
                  name: challenge.creator?.username || "Unknown",
                  avatar: challenge.creator?.avatar_url || undefined,
                }}
                media={challenge.media}
                coverImage={
                  challenge.cover_url || "/images/placeholders/game-cover.jpg"
                }
                participantCount={
                  challenge.participant_count ||
                  challenge.participants?.length ||
                  0
                }
                participantAvatars={
                  challenge.participants
                    ?.slice(0, 3)
                    .map((p: ChallengeParticipant) => ({
                      image: p.user?.avatar_url,
                      fallback: p.user?.username?.[0].toUpperCase() || "U",
                    })) || []
                }
                status={challenge.status as ValidChallengeStatus}
                type={challenge.type}
                {...getActionProps(challenge)}
              />
            );
          })}
        </div>
      </section>
    );
  };

  const renderAllChallenges = () => {
    if (!allChallenges?.length)
      return (
        <div className="text-center py-12 text-muted-foreground">
          No challenges available at the moment.
        </div>
      );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allChallenges.map((challenge) => {
          if (!challenge?.id) return null;
          return (
            <ChallengeCard
              key={challenge.id}
              title={challenge.title || "Untitled Challenge"}
              description={challenge.description || "No description available"}
              organizer={{
                name: challenge.creator?.username || "Unknown",
                avatar: challenge.creator?.avatar_url || undefined,
              }}
              media={challenge.media}
              coverImage={
                challenge.cover_url || "/images/placeholders/game-cover.jpg"
              }
              participantCount={
                challenge.participant_count ||
                challenge.participants?.length ||
                0
              }
              participantAvatars={
                challenge.participants
                  ?.slice(0, 3)
                  .map((p: ChallengeParticipant) => ({
                    image: p.user?.avatar_url,
                    fallback: p.user?.username?.[0].toUpperCase() || "U",
                  })) || []
              }
              status={challenge.status as ValidChallengeStatus}
              type={challenge.type}
              {...getActionProps(challenge)}
            />
          );
        })}
      </div>
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
          <Button
            onClick={handleCreateChallenge}
            className="relative inline-flex h-11 items-center justify-center rounded-[8px] bg-background px-6 font-medium text-neutral-200 transition-colors hover:text-neutral-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Challenge
          </Button>
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
                <div className="pb-8">{renderAllChallenges()}</div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
