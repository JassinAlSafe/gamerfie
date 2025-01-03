"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Badge } from "@/types/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal } from "lucide-react";
import Image from "next/image";

interface UserBadge {
  badge: Badge;
  awarded_at: string;
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
        setBadges(data || []);
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
      <div className="flex items-center justify-center p-8">
        <p>Loading badges...</p>
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

  if (!badges.length) {
    return (
      <Card className="bg-muted/50 border-0">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Medal className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            No badges earned yet. Complete challenges to earn badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {badges.map((userBadge) => (
        <Card
          key={`${userBadge.badge.id}-${userBadge.awarded_at}`}
          className="bg-muted/50 border-0"
        >
          <CardContent className="p-6 space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              {userBadge.badge.icon_url ? (
                <Image
                  src={userBadge.badge.icon_url}
                  alt={userBadge.badge.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Medal className="w-full h-full text-primary" />
              )}
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">{userBadge.badge.name}</h3>
              <p className="text-sm text-muted-foreground">
                {userBadge.badge.description}
              </p>
              {userBadge.challenge && (
                <p className="text-xs text-muted-foreground">
                  Earned from: {userBadge.challenge.title}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Awarded: {new Date(userBadge.awarded_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
