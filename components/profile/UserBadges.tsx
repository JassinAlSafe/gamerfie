"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Badge } from "@/types/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserBadge {
  badge: Badge;
  claimed_at: string;
  challenge?: {
    id: string;
    title: string;
  };
}

export default function UserBadges() {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchUserBadges = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("user_badges")
          .select(
            `
            claimed_at,
            badge:badge_id (
              id,
              name,
              description,
              icon_url,
              type,
              rarity
            ),
            challenge:challenge_id (
              id,
              title
            )
          `
          )
          .eq("user_id", user.id)
          .order("claimed_at", { ascending: false });

        if (error) throw error;
        setBadges((data as any) || []);
      } catch (error) {
        console.error("Error fetching user badges:", error);
        setError("Failed to fetch badges");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBadges();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        <p>{error}</p>
      </div>
    );
  }

  if (!badges.length) {
    return (
      <div className="text-center p-8">
        <Medal className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No badges earned yet. Complete challenges to earn badges!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((userBadge) => (
        <Card
          key={`${userBadge.badge.id}-${userBadge.claimed_at}`}
          className={cn(
            "overflow-hidden border-0",
            userBadge.badge.rarity === "legendary" && "bg-yellow-500/10",
            userBadge.badge.rarity === "epic" && "bg-purple-500/10",
            userBadge.badge.rarity === "rare" && "bg-blue-500/10",
            userBadge.badge.rarity === "common" && "bg-gray-500/10"
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {userBadge.badge.name}
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    userBadge.badge.rarity === "legendary" &&
                      "bg-yellow-500/20 text-yellow-500",
                    userBadge.badge.rarity === "epic" &&
                      "bg-purple-500/20 text-purple-500",
                    userBadge.badge.rarity === "rare" &&
                      "bg-blue-500/20 text-blue-500",
                    userBadge.badge.rarity === "common" &&
                      "bg-gray-500/20 text-gray-500"
                  )}
                >
                  {userBadge.badge.rarity}
                </span>
              </CardTitle>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  userBadge.badge.type === "challenge" &&
                    "bg-green-500/20 text-green-500",
                  userBadge.badge.type === "achievement" &&
                    "bg-blue-500/20 text-blue-500",
                  userBadge.badge.type === "special" &&
                    "bg-purple-500/20 text-purple-500",
                  userBadge.badge.type === "community" &&
                    "bg-orange-500/20 text-orange-500"
                )}
              >
                {userBadge.badge.type}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                "relative w-24 h-24 mx-auto rounded-lg overflow-hidden",
                userBadge.badge.rarity === "legendary" && "bg-yellow-500/20",
                userBadge.badge.rarity === "epic" && "bg-purple-500/20",
                userBadge.badge.rarity === "rare" && "bg-blue-500/20",
                userBadge.badge.rarity === "common" && "bg-gray-500/20"
              )}
            >
              {userBadge.badge.icon_url ? (
                <Image
                  src={userBadge.badge.icon_url}
                  alt={userBadge.badge.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = "none";
                    const parent = imgElement.parentElement;
                    if (parent) {
                      const fallback = document.createElement("div");
                      fallback.className =
                        "w-full h-full flex items-center justify-center";
                      fallback.innerHTML = `<svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <Medal
                  className={cn(
                    "w-full h-full p-4",
                    userBadge.badge.rarity === "legendary" && "text-yellow-500",
                    userBadge.badge.rarity === "epic" && "text-purple-500",
                    userBadge.badge.rarity === "rare" && "text-blue-500",
                    userBadge.badge.rarity === "common" && "text-gray-500"
                  )}
                />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                {userBadge.badge.description}
              </p>
              {userBadge.challenge && (
                <p className="text-xs text-muted-foreground text-center">
                  Earned from challenge: {userBadge.challenge.title}
                </p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Claimed on:{" "}
                {new Date(userBadge.claimed_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
