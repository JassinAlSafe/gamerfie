"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useChallengesStore } from "@/store/challenges";
import { useLeaderboard } from "@/store/leaderboard";
import { useUser } from "@/store/user";
import { ChallengeDetails } from "@/components/Challenges/ChallengeDetails";
import { ChallengeLeaderboard } from "@/components/Challenges/ChallengeLeaderboard";
import { ProgressTracker } from "@/components/Challenges/ProgressTracker";
import { RewardClaimer } from "@/components/Challenges/RewardClaimer";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ChallengePage() {
  const params = useParams<{ id: string }>();
  const { user, fetchUser, isLoading: isUserLoading } = useUser();
  const { challenge, fetchChallenge, error, isLoading } = useChallengesStore();
  const { leaderboard, fetchLeaderboard } = useLeaderboard();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchUser();
      fetchChallenge(params.id);
      fetchLeaderboard(params.id);
    }
  }, [params.id, fetchChallenge, fetchLeaderboard, fetchUser]);

  const handleProgressUpdate = async (progress: number) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/challenges/${params.id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update progress");
      }

      await fetchChallenge(params.id);
      await fetchLeaderboard(params.id);
      toast({
        title: "Success",
        description: "Your challenge progress has been updated.",
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/challenges/${params.id}/claim`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to claim rewards");
      }

      await fetchChallenge(params.id);
      toast({
        title: "Success",
        description:
          "Congratulations! You've successfully claimed your rewards.",
      });
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to claim rewards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: challenge?.title,
          text: `Check out this challenge: ${challenge?.title}`,
          url: window.location.href,
        })
        .then(() => {
          toast({
            title: "Shared Successfully",
            description: "The challenge has been shared.",
          });
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link Copied",
          description: "The challenge link has been copied to your clipboard.",
        });
      });
    }
  };

  const handleJoinChallenge = async () => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/challenges/${params.id}/join`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to join challenge");
      }

      await fetchChallenge(params.id);
      await fetchLeaderboard(params.id);
      toast({
        title: "Success",
        description: "You've joined the challenge!",
      });
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (error) {
    return (
      <div className="container">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || isUserLoading || !challenge) {
    return (
      <div className="container">
        <div className="space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const userParticipant = challenge.participants?.find(
    (p) => p.user?.id === user?.id
  );

  const hasClaimedRewards = false; // We'll implement this later with the claimed_rewards table

  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundBeams />
      <div className="container relative z-10">
        <div className="space-y-6">
          <Card className="border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl font-bold">
                  {challenge.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {!userParticipant &&
                    (challenge.status === "upcoming" ||
                      challenge.status === "active") && (
                      <Button
                        onClick={handleJoinChallenge}
                        disabled={updating}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        {updating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          "Join Challenge"
                        )}
                      </Button>
                    )}
                  {!userParticipant &&
                    challenge.status !== "upcoming" &&
                    challenge.status !== "active" && (
                      <Alert variant="warning" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Challenge Not Joinable</AlertTitle>
                        <AlertDescription>
                          This challenge is{" "}
                          {challenge.status === "completed"
                            ? "already completed"
                            : "not open for joining"}
                          .
                        </AlertDescription>
                      </Alert>
                    )}
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/30"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!userParticipant &&
                challenge.status !== "upcoming" &&
                challenge.status !== "active" && (
                  <Alert variant="warning" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Challenge Not Joinable</AlertTitle>
                    <AlertDescription>
                      This challenge is{" "}
                      {challenge.status === "completed"
                        ? "already completed"
                        : "not open for joining"}
                      .
                    </AlertDescription>
                  </Alert>
                )}
              <ChallengeDetails
                challenge={challenge}
                isLoading={false}
                error={null}
                onShare={handleShare}
              />
            </CardContent>
          </Card>

          {userParticipant && (
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TabsTrigger value="progress">Your Progress</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>
              <TabsContent value="progress">
                <Card className="border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressTracker
                      challengeId={params.id}
                      currentProgress={userParticipant.progress}
                      onProgressUpdate={handleProgressUpdate}
                      isLoading={updating}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rewards">
                <Card className="border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <CardHeader>
                    <CardTitle>Claim Your Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RewardClaimer
                      challengeId={params.id}
                      rewards={challenge.rewards}
                      onClaimRewards={handleClaimRewards}
                      isCompleted={userParticipant.completed}
                      isClaimed={hasClaimedRewards}
                      isLoading={updating}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {leaderboard && (
            <Card className="border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <ChallengeLeaderboard leaderboard={leaderboard} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
