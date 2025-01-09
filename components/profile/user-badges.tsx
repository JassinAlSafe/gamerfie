"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Star, Medal, Crown, Shield } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  type: "challenge" | "achievement" | "special" | "community";
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface UserBadge {
  badge: Badge;
  awarded_at: string;
  challenge?: {
    id: string;
    title: string;
  } | null;
}

interface DatabaseBadgeResponse {
  badge: {
    id: string;
    name: string;
    description: string;
    icon_url?: string;
    type: "challenge" | "achievement" | "special" | "community";
    rarity: "common" | "rare" | "epic" | "legendary";
  };
  awarded_at: string;
  challenge: {
    id: string;
    title: string;
  } | null;
}

const RARITY_ICONS = {
  legendary: Crown,
  epic: Star,
  rare: Shield,
  common: Medal,
} as const;

const RARITY_COLORS = {
  legendary: "text-yellow-400 bg-yellow-400/10",
  epic: "text-purple-400 bg-purple-400/10",
  rare: "text-blue-400 bg-blue-400/10",
  common: "text-gray-400 bg-gray-400/10",
} as const;

export default function UserBadges() {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;

        const { data, error } = await supabase
          .from("user_badges")
          .select(
            `
            badge:badges (
              id,
              name,
              description,
              icon_url,
              type,
              rarity
            ),
            awarded_at:claimed_at,
            challenge:challenges (
              id,
              title
            )
          `
          )
          .eq("user_id", session.session.user.id);

        if (error) throw error;

        if (data) {
          // First cast to unknown, then to our expected type
          const typedData = data as unknown as DatabaseBadgeResponse[];
          const transformedBadges: UserBadge[] = typedData.map((item) => ({
            badge: {
              id: item.badge.id,
              name: item.badge.name,
              description: item.badge.description,
              icon_url: item.badge.icon_url,
              type: item.badge.type,
              rarity: item.badge.rarity,
            },
            awarded_at: item.awarded_at,
            challenge: item.challenge,
          }));
          setBadges(transformedBadges);
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
        setError("Failed to load badges");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [supabase]);

  const RarityIcon = (rarity: keyof typeof RARITY_ICONS) => {
    const Icon = RARITY_ICONS[rarity] || Medal;
    return (
      <Icon
        className={cn(
          "w-5 h-5",
          rarity === "legendary" && "text-yellow-400",
          rarity === "epic" && "text-purple-400",
          rarity === "rare" && "text-blue-400",
          rarity === "common" && "text-gray-400"
        )}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Unlocked Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((userBadge) => (
          <div
            key={`${userBadge.badge.id}-${userBadge.awarded_at}`}
            className="flex items-center gap-6 bg-gray-900/50 hover:bg-gray-800/50 transition-colors rounded-lg p-6"
          >
            {/* Badge Icon */}
            <div className="relative w-16 h-16 flex-shrink-0">
              {userBadge.badge.icon_url ? (
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={userBadge.badge.icon_url}
                    alt={userBadge.badge.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "w-full h-full rounded-full flex items-center justify-center",
                    userBadge.badge.rarity === "legendary" &&
                      "bg-yellow-500/20",
                    userBadge.badge.rarity === "epic" && "bg-purple-500/20",
                    userBadge.badge.rarity === "rare" && "bg-blue-500/20",
                    userBadge.badge.rarity === "common" && "bg-gray-500/20"
                  )}
                >
                  {RarityIcon(userBadge.badge.rarity)}
                </div>
              )}
            </div>

            {/* Badge Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">
                    {userBadge.badge.name}
                  </h3>
                  <span className="text-purple-500 font-bold">NY!</span>
                </div>
                <div className="flex-shrink-0">
                  {RarityIcon(userBadge.badge.rarity)}
                </div>
              </div>
              <p className="text-gray-400 mb-1">
                {userBadge.badge.description}
              </p>
              <div className="text-gray-500 text-sm">
                <span className="capitalize">{userBadge.badge.rarity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {badges.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-32 h-32 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
            <span className="text-6xl">🏆</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Badges Yet
          </h3>
          <p className="text-gray-400 max-w-md">
            Complete challenges and achievements to earn badges and show off
            your gaming accomplishments!
          </p>
        </div>
      )}
    </div>
  );
}
