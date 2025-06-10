"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

// Types
interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
}

interface Goal {
  id: string;
  type:
    | "complete_games"
    | "achieve_trophies"
    | "play_time"
    | "review_games"
    | "score_points"
    | "reach_level";
  target: number;
  description: string;
}

interface Team {
  id: string;
  name: string;
  progress: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "competitive" | "collaborative";
  status: "upcoming" | "active" | "completed";
  start_date: string;
  end_date: string;
  goals: Goal[];
  teams?: Team[];
  creator_id: string;
  created_at: string;
  updated_at: string;
}

interface LoadingState {
  auth: boolean;
  challenges: boolean;
}

export default function TestChallenge() {
  const { toast } = useToast();
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    auth: true,
    challenges: false,
  });
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  const fetchChallenges = useCallback(async () => {
    setLoading((prev) => ({ ...prev, challenges: true }));
    try {
      const response = await fetch("/api/challenges");
      const responseText = await response.text();

      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        if (data.error === "Not authenticated") {
          toast({
            title: "Authentication Required",
            description: "Please sign in to view challenges",
            variant: "destructive",
          });
          router.push("/signin");
          return;
        }

        if (data.error === "User profile not found") {
          toast({
            title: "Profile Required",
            description: "Please complete your profile to view challenges",
            variant: "destructive",
          });
          router.push("/profile/edit");
          return;
        }

        throw new Error(
          data.error || data.details || "Failed to fetch challenges"
        );
      }

      setChallenges(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch challenges",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, challenges: false }));
    }
  }, [toast, router]);

  const checkUser = useCallback(async () => {
    try {
      console.log("Checking user authentication...");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }

      if (!user) {
        console.log("No user found, redirecting to signin");
        toast({
          title: "Authentication Required",
          description: "Please sign in to access challenges",
          variant: "destructive",
        });
        router.push("/signin");
        return;
      }

      console.log("User found:", user.id);

      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      if (!profile) {
        console.log("No profile found, redirecting to profile edit");
        toast({
          title: "Profile Required",
          description: "Please complete your profile first",
          variant: "destructive",
        });
        router.push("/profile/edit");
        return;
      }

      console.log("Profile found:", profile.id);

      setUser(user);
      setProfile(profile);
      await fetchChallenges();
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Authentication Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to check authentication",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  }, [toast, router, supabase, fetchChallenges]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const createTestChallenge = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description:
          "Please sign in and complete your profile to create challenges",
        variant: "destructive",
      });
      return;
    }

    try {
      // First create the challenge
      const { data: challenge, error: challengeError } = await supabase
        .from("challenges")
        .insert({
          title: "Simple-Test-Challenge",
          description:
            "This is a simple test challenge with minimal requirements to verify the system functionality.",
          type: "collaborative",
          status: "upcoming",
          start_date: new Date(Date.now() + 86400000).toISOString(),
          end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
          min_participants: 2,
          creator_id: user.id,
        })
        .select()
        .single();

      if (challengeError) {
        console.error("Challenge creation error:", challengeError);
        throw challengeError;
      }

      // Then create the goal
      const { error: goalError } = await supabase
        .from("challenge_goals")
        .insert({
          challenge_id: challenge.id,
          type: "complete_games",
          target: 1,
          description: "Complete one game to test the system",
        });

      if (goalError) {
        console.error("Goal creation error:", goalError);
        throw goalError;
      }

      // Create the reward
      const { error: rewardError } = await supabase
        .from("challenge_rewards")
        .insert({
          challenge_id: challenge.id,
          type: "badge",
          name: "Test Champion",
          description: "Successfully completed the test challenge system",
        });

      if (rewardError) {
        console.error("Reward creation error:", rewardError);
        throw rewardError;
      }

      // Create the rule
      const { error: ruleError } = await supabase
        .from("challenge_rules")
        .insert({
          challenge_id: challenge.id,
          rule: "Complete the goal to verify system functionality",
        });

      if (ruleError) {
        console.error("Rule creation error:", ruleError);
        throw ruleError;
      }

      // Add creator as first participant
      const { error: participantError } = await supabase
        .from("challenge_participants")
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          progress: 0,
          completed: false,
        });

      if (participantError) {
        console.error("Participant creation error:", participantError);
        throw participantError;
      }

      toast({
        title: "Success",
        description: "Challenge created successfully",
      });

      await fetchChallenges();
    } catch (error) {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? `Failed to create challenge: ${error.message}`
            : "Failed to create challenge",
        variant: "destructive",
      });
    }
  };

  if (loading.auth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p>Please sign in and complete your profile to access challenges</p>
          <Button onClick={() => router.push("/signin")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Test Challenge System</h1>
        <Button onClick={createTestChallenge}>Create Test Challenge</Button>
      </div>

      {loading.challenges ? (
        <div className="text-center py-8">Loading challenges...</div>
      ) : (
        <div className="grid gap-4">
          {challenges.length === 0 ? (
            <Card className="p-4 text-center">
              <p>No challenges found. Create one to get started!</p>
            </Card>
          ) : (
            challenges.map((challenge) => (
              <Card key={challenge.id} className="p-4">
                <h2 className="text-xl font-semibold">{challenge.title}</h2>
                <p className="text-gray-500">{challenge.description}</p>
                <div className="mt-2">
                  <h3 className="font-medium">Goals:</h3>
                  <ul className="list-disc list-inside">
                    {challenge.goals?.map((goal) => (
                      <li key={goal.id}>
                        {goal.description} (Target: {goal.target})
                      </li>
                    ))}
                  </ul>
                </div>
                {challenge.teams && challenge.teams.length > 0 && (
                  <div className="mt-2">
                    <h3 className="font-medium">Teams:</h3>
                    <ul className="list-disc list-inside">
                      {challenge.teams.map((team) => (
                        <li key={team.id}>
                          {team.name} (Progress: {Math.round(team.progress)}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
