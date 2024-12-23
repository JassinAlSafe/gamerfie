"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/store/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { ClaimedReward } from "@/types/challenge";

export default function RewardsPage() {
  const { user } = useUser();
  const [rewards, setRewards] = useState<ClaimedReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRewards() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/rewards");
        if (!response.ok) {
          throw new Error("Failed to fetch rewards");
        }
        const data = await response.json();
        setRewards(data);
      } catch (error) {
        console.error("Error fetching rewards:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch rewards"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchRewards();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-8">Your Rewards</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rewards.length === 0 ? (
          <div className="col-span-full">
            <Alert>
              <AlertTitle>No Rewards Yet</AlertTitle>
              <AlertDescription>
                Complete challenges to earn rewards!
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          rewards.map((reward) => (
            <Card
              key={reward.id}
              className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {reward.type === "badge" && "🏅"}
                  {reward.type === "points" && "💎"}
                  {reward.type === "title" && "👑"}
                  {reward.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">{reward.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Earned from: {reward.challenge_title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Claimed on: {new Date(reward.claimed_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
