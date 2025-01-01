"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Badge } from "@/types/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal } from "lucide-react";
import Image from "next/image";

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
          .from("user_badge_claims")
          .select(
            `
            claimed_at,
            badge:badge_id (
              id,
              name,
              description,
              icon_url
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
          className="overflow-hidden"
        >
          <CardHeader>
            <CardTitle className="text-lg">{userBadge.badge.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full aspect-square">
              {userBadge.badge.icon_url ? (
                <Image
                  src={userBadge.badge.icon_url}
                  alt={userBadge.badge.name}
                  fill
                  className="object-contain"
                />
              ) : (
                <Medal className="w-full h-full text-primary/20" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {userBadge.badge.description}
              </p>
              {userBadge.challenge && (
                <p className="text-xs text-muted-foreground mt-2">
                  Earned from challenge: {userBadge.challenge.title}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Earned on: {new Date(userBadge.claimed_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
