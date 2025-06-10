"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Reward {
  type: "badge" | "points" | "title";
  name: string;
  description: string;
}

interface RewardClaimerProps {
  challengeId: string;
  rewards: Reward[];
  isCompleted: boolean;
  isClaimed: boolean;
  isLoading: boolean;
  onClaimRewards: () => Promise<void>;
}

export function RewardClaimer({
  rewards,
  isCompleted,
  isClaimed,
  isLoading,
  onClaimRewards,
}: RewardClaimerProps) {
  const [claiming, setClaiming] = useState(false);

  const handleClaimRewards = async () => {
    try {
      setClaiming(true);
      await onClaimRewards();
      toast({
        title: "Success",
        description: "Rewards claimed successfully!",
      });
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to claim rewards",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (!isCompleted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-yellow-500">
          <Trophy className="w-5 h-5" />
          <h3 className="font-semibold">Available Rewards</h3>
        </div>
        <div className="grid gap-4">
          {rewards.map((reward, index) => (
            <Card key={index} className="p-4 bg-gray-800/50 border-gray-700/50">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-200">{reward.name}</h4>
                  <p className="text-sm text-gray-400">{reward.description}</p>
                </div>
                <div className="text-xs font-medium uppercase text-gray-500">
                  {reward.type}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-sm text-gray-400">
          Complete the challenge to claim these rewards!
        </p>
      </div>
    );
  }

  if (isClaimed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-500">
          <Trophy className="w-5 h-5" />
          <h3 className="font-semibold">Rewards Claimed!</h3>
        </div>
        <div className="grid gap-4">
          {rewards.map((reward, index) => (
            <Card key={index} className="p-4 bg-gray-800/50 border-gray-700/50">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-200">{reward.name}</h4>
                  <p className="text-sm text-gray-400">{reward.description}</p>
                </div>
                <div className="text-xs font-medium uppercase text-green-500">
                  Claimed
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-yellow-500">
        <Trophy className="w-5 h-5" />
        <h3 className="font-semibold">Claim Your Rewards!</h3>
      </div>
      <div className="grid gap-4">
        {rewards.map((reward, index) => (
          <Card key={index} className="p-4 bg-gray-800/50 border-gray-700/50">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-200">{reward.name}</h4>
                <p className="text-sm text-gray-400">{reward.description}</p>
              </div>
              <div className="text-xs font-medium uppercase text-yellow-500">
                {reward.type}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Button
        className="w-full"
        onClick={handleClaimRewards}
        disabled={claiming || isLoading}
      >
        {claiming ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Claiming Rewards...
          </>
        ) : (
          "Claim Rewards"
        )}
      </Button>
    </div>
  );
}
