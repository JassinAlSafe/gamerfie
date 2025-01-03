import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { PlaceholderBadge } from "@/components/ui/placeholder-image";
import { BadgeImage } from "@/components/ui/placeholder-image";

type ChallengeReward = {
  id: string;
  badge_id: string;
  badge: {
    id: string;
    name: string;
    description: string;
    image_url?: string;
  };
  claimed?: {
    user_id: string;
    badge_id: string;
    claimed_at: string;
  }[];
};

const DEFAULT_BADGE_IMAGE = "/images/default-badge.svg";

export function ChallengeBadges({
  challenge,
  userProgress,
}: {
  challenge: { id: string; rewards: ChallengeReward[] };
  userProgress?: { completed: boolean };
}) {
  const [claimingBadgeId, setClaimingBadgeId] = useState<string | null>(null);

  const isBadgeClaimed = (reward: ChallengeReward) => {
    return reward.claimed && reward.claimed.length > 0;
  };

  const handleClaimBadge = async (reward: ChallengeReward) => {
    // Early return if already claimed
    if (isBadgeClaimed(reward)) {
      toast.error("Badge already claimed");
      return;
    }

    if (claimingBadgeId) return;
    if (!challenge?.id) {
      console.error("No challenge ID available");
      toast.error("Unable to claim badge: Missing challenge ID");
      return;
    }

    const url = `/api/challenges/${challenge.id}/badges/claim`;
    const fullUrl = new URL(url, window.location.origin).toString();

    console.log("Claiming badge:", {
      challengeId: challenge.id,
      badgeId: reward.badge_id,
      url: fullUrl,
      isClaimed: isBadgeClaimed(reward),
    });

    setClaimingBadgeId(reward.badge_id);
    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ badge_id: reward.badge_id }),
        credentials: "include",
      });

      const text = await response.text();
      console.log("Raw response:", text);

      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        console.error("Parse error:", e);
        toast.error("Invalid response from server");
        return;
      }

      if (!response.ok) {
        const errorMessage = data?.error || "Failed to claim badge";
        toast.error(errorMessage);
        return;
      }

      toast.success("Badge claimed successfully! 🎉", {
        description: "Check your profile to see your new badge!",
      });

      // Force a re-render to show the badge as claimed
      window.location.reload();
    } catch (error) {
      console.error("Error claiming badge:", error);
      toast.error("Failed to claim badge. Please try again.");
    } finally {
      setClaimingBadgeId(null);
    }
  };

  const getBadgeImageUrl = (badge: ChallengeDetails["rewards"][0]["badge"]) => {
    if (!badge) return DEFAULT_BADGE_IMAGE;
    return badge.image_url || badge.icon_url || DEFAULT_BADGE_IMAGE;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {challenge.rewards?.map((reward) => (
        <div
          key={reward.id}
          className="relative p-4 rounded-lg border border-white/10 bg-gray-900/50"
        >
          <div className="flex items-center gap-4">
            <BadgeImage
              imageUrl={reward.badge?.image_url}
              name={reward.badge?.name || "Badge"}
              size="md"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white">
                {reward.badge?.name || "Unknown Badge"}
              </h3>
              <p className="text-sm text-gray-400">
                {reward.badge?.description || "No description available"}
              </p>
            </div>
          </div>

          {userProgress?.completed ? (
            isBadgeClaimed(reward) ? (
              <div className="mt-4 text-center py-2 px-4 rounded-md bg-green-500/10 text-green-400 font-medium">
                Badge Claimed ✓
              </div>
            ) : (
              <Button
                onClick={() => handleClaimBadge(reward)}
                disabled={claimingBadgeId === reward.badge_id}
                className="mt-4 w-full"
              >
                {claimingBadgeId === reward.badge_id
                  ? "Claiming..."
                  : "Claim Badge"}
              </Button>
            )
          ) : (
            <div className="mt-4 text-center py-2 px-4 rounded-md bg-gray-800 text-gray-400">
              Complete Challenge to Claim
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
