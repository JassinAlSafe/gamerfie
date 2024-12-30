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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link
          href="/challenges"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Challenges
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
            <p className="text-muted-foreground">{challenge.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={
                challenge.type === "competitive" ? "default" : "secondary"
              }
            >
              {challenge.type}
            </Badge>
            <Badge
              variant={
                challenge.status === "active"
                  ? "default"
                  : challenge.status === "upcoming"
                  ? "secondary"
                  : "outline"
              }
            >
              {challenge.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Challenge Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-semibold">Created by:</span>{" "}
              {challenge.creator?.username}
            </div>
            <div>
              <span className="font-semibold">Start Date:</span>{" "}
              {formatDate(challenge.start_date)}
            </div>
            <div>
              <span className="font-semibold">End Date:</span>{" "}
              {formatDate(challenge.end_date)}
            </div>
            <div>
              <span className="font-semibold">Participants:</span>{" "}
              {challenge.participants?.length || 0} /{" "}
              {challenge.max_participants || "∞"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <CardDescription>Challenge objectives to complete</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {challenge.goals?.map((goal) => (
                <li key={goal.id} className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {goal.type.replace("_", " ")}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {goal.description || `Target: ${goal.target}`}
                    </p>
                  </div>
                  <span className="font-mono">{goal.target}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
            <CardDescription>What you can earn</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {challenge.rewards?.map((reward) => (
                <li key={reward.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{reward.type}</Badge>
                    <span className="font-semibold">{reward.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reward.description}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rules</CardTitle>
            <CardDescription>Challenge guidelines</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {challenge.rules?.map((rule) => (
                <li key={rule.id} className="text-muted-foreground">
                  {rule.rule}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>
              {challenge.participants?.length || 0} participants joined
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {challenge.participants?.map((participant) => (
                <div
                  key={participant.user_id}
                  className="flex items-center gap-2"
                >
                  {participant.user?.avatar_url && (
                    <img
                      src={participant.user.avatar_url}
                      alt={participant.user?.username}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {participant.user?.username || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDate(participant.joined_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
        {isParticipating() ? (
          <Button
            size="lg"
            onClick={() => router.push(`/profile/challenges/${challenge.id}`)}
          >
            View Your Progress
          </Button>
        ) : (
          <Button size="lg" onClick={handleJoinChallenge}>
            Join Challenge
          </Button>
        )}
      </div>
    </div>
  );
}
