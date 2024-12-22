"use client";

import { useEffect, useState } from "react";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { Challenge, ChallengeStatus } from "@/types/challenge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Trophy,
  Users,
  Calendar,
  Target,
  Share2,
  Gamepad2,
  ArrowLeft,
  Loader2,
  Crown,
  Flag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface ChallengeDetailsProps {
  challenge: Challenge;
  isLoading: boolean;
  error: string | null;
  onJoin: () => void;
  onLeave: () => void;
  onShare: () => void;
}

export function ChallengeDetails({
  challenge,
  isLoading,
  error,
  onJoin,
  onLeave,
  onShare,
}: ChallengeDetailsProps) {
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const getStatusVariant = (status: ChallengeStatus): BadgeVariant => {
    switch (status) {
      case "upcoming":
        return "default";
      case "active":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      await onJoin();
      toast({
        title: "Success",
        description: "You have joined the challenge!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join the challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      setIsLeaving(true);
      await onLeave();
      toast({
        title: "Success",
        description: "You have left the challenge.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave the challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading challenge: {error}</p>
      </div>
    );
  }

  if (isLoading || !challenge) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isParticipant = challenge.participants?.some(
    (p) => p.user_id === challenge.creator_id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/challenges"
          className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Challenges</span>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 hover:border-purple-500/50"
          onClick={onShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      <Card className="p-6 bg-gray-800/50 border-gray-700/50">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold">{challenge.title}</h1>
              <Badge
                variant={
                  challenge.type === "competitive" ? "default" : "secondary"
                }
                className="bg-purple-500/10 text-purple-400 border-purple-500/20"
              >
                {challenge.type}
              </Badge>
              <Badge variant={getStatusVariant(challenge.status)}>
                {challenge.status}
              </Badge>
            </div>
            <p className="text-gray-400">{challenge.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gray-800/30 border-gray-700/30">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Goal</p>
                  <p className="font-medium">
                    {challenge.goal?.target || 0}{" "}
                    {challenge.goal?.type || "complete_games"}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gray-800/30 border-gray-700/30">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Participants</p>
                  <p className="font-medium">
                    {challenge.participants?.length || 0} /{" "}
                    {challenge.max_participants || "∞"}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gray-800/30 border-gray-700/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Timeline</p>
                  <p className="font-medium">
                    {challenge.status === "upcoming"
                      ? `Starts ${formatDistanceToNow(
                          new Date(challenge.start_date),
                          {
                            addSuffix: true,
                          }
                        )}`
                      : `Ends ${formatDistanceToNow(
                          new Date(challenge.end_date),
                          {
                            addSuffix: true,
                          }
                        )}`}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {challenge.rewards && challenge.rewards.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Rewards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenge.rewards.map((reward, index) => (
                  <Card
                    key={index}
                    className="p-4 bg-gray-800/30 border-gray-700/30"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="font-medium">{reward.name}</p>
                        <p className="text-sm text-gray-400">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {challenge.rules && challenge.rules.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Flag className="w-5 h-5 text-purple-400" />
                Rules
              </h2>
              <div className="space-y-2">
                {challenge.rules.map((ruleObj, index) => (
                  <div
                    key={ruleObj.id || index}
                    className="flex items-start gap-2"
                  >
                    <div className="mt-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-gray-400">{ruleObj.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            {isParticipant ? (
              <Button
                variant="destructive"
                onClick={handleLeave}
                disabled={isLeaving}
                className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
              >
                {isLeaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Leave Challenge
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Join Challenge
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {challenge.participants && challenge.participants.length > 0 && (
        <Card className="p-6 bg-gray-800/50 border-gray-700/50">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Participants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenge.participants.map((participant) => (
                <Card
                  key={participant.user_id}
                  className="p-4 bg-gray-800/30 border-gray-700/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={participant.avatar_url} />
                      <AvatarFallback>
                        {participant.username
                          ? participant.username.slice(0, 2).toUpperCase()
                          : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {participant.username || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={participant.progress || 0}
                          className="h-2"
                        />
                        <span className="text-sm text-gray-400">
                          {participant.progress || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
