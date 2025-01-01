"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Badge as BadgeType } from "@/types/badge";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Star } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserBadgesProps {
  userId: string;
}

export function UserBadges({ userId }: UserBadgesProps) {
  const { supabase } = useSupabase();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("recent");

  useEffect(() => {
    fetchUserBadges();
  }, [userId]);

  const fetchUserBadges = async () => {
    try {
      const { data, error } = await supabase
        .from("user_badge_claims")
        .select(
          `
          badge:badge_id (
            id,
            name,
            description,
            icon_url,
            created_at
          ),
          claimed_at,
          challenge:challenge_id (
            title
          )
        `
        )
        .eq("user_id", userId)
        .order("claimed_at", { ascending: false });

      if (error) throw error;

      setBadges(
        data.map((item) => ({
          ...item.badge,
          claimed_at: item.claimed_at,
          challenge_title: item.challenge?.title,
        }))
      );
    } catch (error) {
      console.error("Error fetching user badges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedBadges = [...badges].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime()
        );
      case "alphabetical":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Badges</h2>
            <p className="text-muted-foreground">
              {badges.length} {badges.length === 1 ? "badge" : "badges"} earned
            </p>
          </div>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] bg-muted/50 border-0">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedBadges.map((badge) => (
          <Card
            key={badge.id}
            className="group bg-muted/50 border-0 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
          >
            <div className="p-4 flex items-start gap-4">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                {badge.icon_url ? (
                  <Image
                    src={badge.icon_url}
                    alt={badge.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <Star className="w-8 h-8 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate group-hover:text-purple-500 transition-colors">
                  {badge.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {badge.description}
                </p>
                {badge.challenge_title && (
                  <div className="flex items-center gap-2 mt-2">
                    <Medal className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-muted-foreground truncate">
                      {badge.challenge_title}
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Earned {new Date(badge.claimed_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {badges.length === 0 && (
        <Card className="bg-muted/50 border-0">
          <div className="p-8 text-center">
            <Medal className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No badges earned yet
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete challenges to earn badges and show them off here!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
