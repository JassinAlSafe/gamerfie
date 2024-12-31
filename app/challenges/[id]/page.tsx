"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Target,
  ScrollText,
  Trophy,
  Calendar,
  Users,
  User,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "competitive" | "collaborative";
  status: "upcoming" | "active" | "completed";
  start_date: string;
  end_date: string;
  min_participants: number;
  max_participants: number | null;
  creator_id: string;
  created_at: string;
  creator?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  goals?: Array<{
    id: string;
    type: string;
    target: number;
    description?: string;
  }>;
  participants?: Array<{
    user_id: string;
    joined_at: string;
    user?: {
      id: string;
      username: string;
      avatar_url?: string;
    };
  }>;
  rewards?: Array<{
    id: string;
    type: "badge" | "points" | "title";
    name: string;
    description: string;
  }>;
  rules?: Array<{
    id: string;
    rule: string;
  }>;
  cover_url?: string;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

export default function ChallengePage({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const init = async () => {
      const profile = await checkUser();
      if (profile) {
        await fetchChallenge();
      }
    };
    init();
  }, [params.id]);

  const checkUser = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile) {
        router.push("/profile");
        return;
      }

      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error("Error checking user:", error);
      toast({
        title: "Error",
        description: "Failed to verify user session",
        variant: "destructive",
      });
    }
  };

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/challenges/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch challenge");
      }

      setChallenge(data);
    } catch (error) {
      console.error("Error fetching challenge:", error);
      toast({
        title: "Error",
        description: "Failed to fetch challenge details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!userProfile || !challenge) return;

    try {
      setLoading(true);
      const { error: participantError } = await supabase
        .from("challenge_participants")
        .insert({
          challenge_id: challenge.id,
          user_id: userProfile.id,
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (participantError) {
        if (participantError.code === "23505") {
          toast({
            title: "Already Joined",
            description: "You are already a participant in this challenge",
          });
          return;
        }
        throw participantError;
      }

      // Initialize progress records for each goal
      if (challenge.goals && challenge.goals.length > 0) {
        const progressRecords = challenge.goals.map((goal) => ({
          challenge_id: challenge.id,
          goal_id: goal.id,
          participant_id: userProfile.id,
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: progressError } = await supabase
          .from("challenge_participant_progress")
          .insert(progressRecords);

        if (progressError) throw progressError;
      }

      toast({
        title: "Success",
        description: "Successfully joined the challenge!",
      });

      // Refresh challenge data
      await fetchChallenge();
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const isParticipating = () => {
    return challenge?.participants?.some((p) => p.user_id === userProfile?.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenge details...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">
            Challenge not found
          </p>
          <Button onClick={() => router.push("/challenges")} variant="outline">
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image Section */}
      <div className="relative w-full h-[40vh] overflow-hidden">
        <Image
          src={challenge.cover_url || "/images/placeholders/game-cover.jpg"}
          alt={challenge.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-background" />

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link
            href="/profile/challenges"
            className="flex items-center gap-2 text-white hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Challenges</span>
          </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background to-transparent">
          <div className="container mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Badge
                className={cn(
                  "px-2 py-1",
                  challenge.status === "active"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : challenge.status === "upcoming"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-blue-500/10 text-blue-500"
                )}
              >
                {challenge.status.charAt(0).toUpperCase() +
                  challenge.status.slice(1)}
              </Badge>
              <Badge
                className={
                  challenge.type === "competitive"
                    ? "bg-purple-500/10 text-purple-500"
                    : "bg-pink-500/10 text-pink-500"
                }
              >
                {challenge.type.charAt(0).toUpperCase() +
                  challenge.type.slice(1)}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {challenge.title}
            </h1>
            <p className="text-lg text-gray-300">{challenge.description}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Goals Section */}
            <div className="bg-secondary/5 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Challenge Goals</h2>
                  <p className="text-muted-foreground">
                    What you need to achieve
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {challenge.goals?.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-start gap-4 p-4 bg-background/80 rounded-lg group transition-all hover:shadow-lg hover:shadow-primary/10 hover:bg-background"
                  >
                    <div className="space-y-3 w-full">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                          {goal.type
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </h4>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </div>
                      {goal.description && (
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                      <p className="text-sm font-medium bg-primary/10 text-primary py-1.5 px-4 rounded-full inline-block">
                        Target: {goal.target}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules Section */}
            {challenge.rules && challenge.rules.length > 0 && (
              <div className="bg-secondary/5 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ScrollText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Challenge Rules</h2>
                    <p className="text-muted-foreground">
                      Guidelines to follow
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 list-none">
                  {challenge.rules.map((rule) => (
                    <li
                      key={rule.id}
                      className="flex items-start gap-4 p-4 bg-background/80 rounded-lg group transition-all hover:shadow-lg hover:shadow-primary/10 hover:bg-background"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                        <span className="text-primary text-sm font-medium">
                          {String(
                            challenge.rules!.findIndex(
                              (r) => r.id === rule.id
                            ) + 1
                          ).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base group-hover:text-primary transition-colors leading-relaxed">
                          {rule.rule}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Challenge Info Card */}
            <div className="bg-secondary/5 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Challenge Info</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-background/80 rounded-lg group transition-all hover:shadow-lg hover:shadow-primary/10 hover:bg-background">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-base font-medium text-muted-foreground mb-1">
                        Duration
                      </p>
                      <p className="text-lg group-hover:text-primary transition-colors">
                        {formatDate(challenge.start_date)} -{" "}
                        {formatDate(challenge.end_date)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-background/80 rounded-lg group transition-all hover:shadow-lg hover:shadow-primary/10 hover:bg-background">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-1" />
                    <div className="w-full">
                      <p className="text-base font-medium text-muted-foreground mb-1">
                        Created by
                      </p>
                      <div className="flex items-center gap-2">
                        {challenge.creator?.avatar_url ? (
                          <Image
                            src={challenge.creator.avatar_url}
                            alt={challenge.creator.username || "Creator"}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <p className="text-lg group-hover:text-primary transition-colors">
                          {challenge.creator?.username || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Participants List */}
                <div className="p-4 bg-background/80 rounded-lg group transition-all hover:shadow-lg hover:shadow-primary/10 hover:bg-background">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-base font-medium text-muted-foreground">
                          Participants
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {challenge.participants?.length || 0} /{" "}
                          {challenge.max_participants || "∞"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {challenge.participants?.map((participant) => (
                          <div
                            key={participant.user_id}
                            className="flex items-center gap-2 bg-secondary/20 rounded-full pl-1 pr-3 py-1"
                          >
                            {participant.user?.avatar_url ? (
                              <Image
                                src={participant.user.avatar_url}
                                alt={
                                  participant.user?.username || "Participant"
                                }
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                            )}
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {participant.user?.username || "Unknown User"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {!isParticipating() && challenge.status === "upcoming" && (
                  <Button
                    className="w-full text-base py-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors mt-4"
                    onClick={handleJoinChallenge}
                    disabled={loading}
                  >
                    {loading ? "Joining..." : "Join Challenge"}
                  </Button>
                )}
              </div>
            </div>

            {/* Rewards Card */}
            {challenge.rewards && challenge.rewards.length > 0 && (
              <div className="bg-secondary/5 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Rewards</h2>
                </div>
                <div className="space-y-4">
                  {challenge.rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="p-4 bg-background/80 rounded-lg group transition-all hover:shadow-lg hover:shadow-primary/10 hover:bg-background"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                          {reward.name}
                        </h4>
                        <Badge className="bg-primary/10 hover:bg-primary/10 text-primary">
                          {reward.type}
                        </Badge>
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {reward.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
