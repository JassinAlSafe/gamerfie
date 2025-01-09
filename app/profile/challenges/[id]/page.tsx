"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChallengeStore } from "@/stores/useChallengeStore";
import { ChallengeBadges } from "@/components/ChallengeBadges";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Trophy,
  Calendar,
  Users,
  User,
  Gamepad2,
  ScrollText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ChallengeDetails } from "@/types/challenge";

export default function ChallengeDetailsPage() {
  const params = useParams();
  const { currentChallenge, isLoading, error, fetchChallengeById } =
    useChallengeStore();

  useEffect(() => {
    if (params.id) {
      fetchChallengeById(params.id as string);
    }
  }, [params.id, fetchChallengeById]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentChallenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold">Challenge not found</h2>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <BackButton />

        {/* Challenge Header with Cover Image */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="aspect-[21/9] relative">
            <Image
              src={
                currentChallenge.cover_url ||
                "/images/placeholder-challenge.jpg"
              }
              alt={currentChallenge.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      currentChallenge.status === "active"
                        ? "bg-green-500/10 text-green-500"
                        : currentChallenge.status === "upcoming"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-gray-500/10 text-gray-500"
                    }
                  >
                    {currentChallenge.status.charAt(0).toUpperCase() +
                      currentChallenge.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {currentChallenge.type}
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold text-white">
                  {currentChallenge.title}
                </h1>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-3 bg-black/50 p-3 rounded-lg backdrop-blur-sm">
                <Avatar>
                  <AvatarImage src={currentChallenge.creator.avatar_url} />
                  <AvatarFallback>
                    {currentChallenge.creator.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-400">Created by</p>
                  <p className="font-medium text-white">
                    {currentChallenge.creator.username}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ScrollText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">About this Challenge</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentChallenge.description}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Participants
                    </p>
                    <p className="font-medium">
                      {currentChallenge.participants?.length || 0} Players
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-medium">
                      {currentChallenge.status === "upcoming"
                        ? `Starts ${formatDistanceToNow(
                            new Date(currentChallenge.start_date),
                            {
                              addSuffix: true,
                            }
                          )}`
                        : `Ends ${formatDistanceToNow(
                            new Date(currentChallenge.end_date),
                            {
                              addSuffix: true,
                            }
                          )}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <Progress
                      value={currentChallenge.userProgress?.progress || 0}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Challenge Badges</h2>
              </div>

              <ChallengeBadges
                challenge={{
                  id: currentChallenge.id,
                  rewards: currentChallenge.rewards || [],
                }}
                userProgress={currentChallenge.userProgress}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participation Status */}
            <div className="bg-card rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-semibold">Your Status</h3>
              {currentChallenge.userProgress ? (
                <>
                  <Progress
                    value={currentChallenge.userProgress.progress || 0}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    {currentChallenge.userProgress.completed
                      ? "Challenge Completed! 🎉"
                      : `${currentChallenge.userProgress.progress}% Complete`}
                  </p>
                </>
              ) : (
                <Button className="w-full" variant="default">
                  Join Challenge
                </Button>
              )}
            </div>

            {/* Participants List */}
            <div className="bg-card rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-semibold">Participants</h3>
              <div className="space-y-3">
                {currentChallenge.participants?.map((participant) => (
                  <div
                    key={participant.user.username}
                    className="flex items-center gap-3"
                  >
                    <Avatar>
                      <AvatarImage src={participant.user.avatar_url} />
                      <AvatarFallback>
                        {participant.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{participant.user.username}</p>
                      <Progress
                        value={participant.progress}
                        className="h-1.5"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {participant.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
