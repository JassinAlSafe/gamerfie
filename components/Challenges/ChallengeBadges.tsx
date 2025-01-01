"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Badge as BadgeType } from "@/types/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Medal, Plus, Trophy, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChallengeBadgesProps {
  challengeId: string;
  isCreator: boolean;
  isCompleted?: boolean;
}

export function ChallengeBadges({
  challengeId,
  isCreator,
  isCompleted = false,
}: ChallengeBadgesProps) {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [availableBadges, setAvailableBadges] = useState<BadgeType[]>([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchChallengeBadges();
    if (isCreator) {
      fetchAvailableBadges();
    }
  }, [challengeId]);

  const fetchChallengeBadges = async () => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/badges`);
      if (!response.ok) throw new Error("Failed to fetch badges");
      const data = await response.json();
      setBadges(data);
    } catch (error) {
      console.error("Error fetching challenge badges:", error);
      toast({
        title: "Error",
        description: "Failed to fetch challenge badges",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableBadges = async () => {
    try {
      const response = await fetch("/api/badges");
      if (!response.ok) throw new Error("Failed to fetch available badges");
      const data = await response.json();
      setAvailableBadges(data);
    } catch (error) {
      console.error("Error fetching available badges:", error);
    }
  };

  const handleAssignBadge = async () => {
    if (!selectedBadgeId) return;

    try {
      setIsAssigning(true);
      const response = await fetch(`/api/challenges/${challengeId}/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_id: selectedBadgeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign badge");
      }

      await fetchChallengeBadges();
      setIsDialogOpen(false);
      setSelectedBadgeId("");

      toast({
        title: "Success",
        description: "Badge assigned to challenge",
      });
    } catch (error) {
      console.error("Error assigning badge:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to assign badge",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClaimBadge = async (badgeId: string) => {
    try {
      setIsClaiming(true);
      const response = await fetch(`/api/challenges/${challengeId}/badges`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_id: badgeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to claim badge");
      }

      toast({
        title: "Success",
        description: "Badge claimed successfully!",
      });

      // Refresh badges to update UI
      await fetchChallengeBadges();
    } catch (error) {
      console.error("Error claiming badge:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to claim badge",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Challenge Badges</h2>
            <p className="text-muted-foreground">
              Complete the challenge to earn these badges
            </p>
          </div>
        </div>
        {isCreator && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Assign Badge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Badge to Challenge</DialogTitle>
                <DialogDescription>
                  Select a badge to assign to this challenge. Participants can
                  claim it upon completion.
                </DialogDescription>
              </DialogHeader>
              <Select
                value={selectedBadgeId}
                onValueChange={setSelectedBadgeId}
              >
                <SelectTrigger className="border-0 bg-muted">
                  <SelectValue placeholder="Select a badge" />
                </SelectTrigger>
                <SelectContent>
                  {availableBadges.map((badge) => (
                    <SelectItem key={badge.id} value={badge.id}>
                      <div className="flex items-center gap-2">
                        {badge.icon_url ? (
                          <div className="relative w-6 h-6 rounded-full overflow-hidden">
                            <Image
                              src={badge.icon_url}
                              alt={badge.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Medal className="w-5 h-5 text-yellow-500" />
                        )}
                        {badge.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button
                  onClick={handleAssignBadge}
                  disabled={!selectedBadgeId || isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign Badge"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {badges.length === 0 ? (
        <Card className="bg-muted/50 border-0">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Medal className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg font-medium">
              No badges assigned to this challenge yet
            </p>
            {isCreator && (
              <p className="text-muted-foreground text-sm mt-2">
                Click "Assign Badge" to add badges that participants can earn
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className={cn(
                "group transition-all duration-300 border-0 bg-muted/50",
                isCompleted && "hover:shadow-lg hover:shadow-purple-500/10"
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-purple-500/10 flex items-center justify-center">
                    {badge.icon_url ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={badge.icon_url}
                          alt={badge.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 64px) 100vw, 64px"
                        />
                      </div>
                    ) : (
                      <Star className="w-8 h-8 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 group-hover:text-purple-500 transition-colors">
                      {badge.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {badge.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isCompleted && (
                  <Button
                    className="w-full bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-0"
                    onClick={() => handleClaimBadge(badge.id)}
                    disabled={isClaiming}
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Claim Badge
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
