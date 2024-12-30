"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

type ChallengeType = "competitive" | "collaborative";
type ChallengeStatus = "upcoming" | "active" | "completed";
type FilterType = "all" | ChallengeType;
type SortType = "date" | "participants";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  start_date: string;
  end_date: string;
  min_participants: number;
  max_participants: number | null;
  creator_id: string;
  created_at: string;
  creator?: UserProfile;
  goals?: ChallengeGoal[];
  participants?: ChallengeParticipant[];
  rewards?: ChallengeReward[];
  rules?: ChallengeRule[];
}

interface ChallengeGoal {
  id: string;
  type: string;
  target: number;
  description?: string;
}

interface ChallengeParticipant {
  user_id: string;
  joined_at: string;
  user?: UserProfile;
}

interface ChallengeReward {
  id: string;
  type: "badge" | "points" | "title";
  name: string;
  description: string;
}

interface ChallengeRule {
  id: string;
  rule: string;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

export default function BrowseChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [status, setStatus] = useState<ChallengeStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const init = async () => {
      const profile = await checkUser();
      if (profile) {
        await fetchChallenges();
      }
    };
    init();
  }, []); // Only run on mount

  // Separate effect for filter changes
  useEffect(() => {
    if (userProfile) {
      fetchChallenges();
    }
  }, [filter, status, sortBy]);

  const checkUser = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        router.push("/profile");
        return;
      }

      setUserProfile(profile);
      return profile; // Return the profile for use in init
    } catch (error) {
      console.error("Error checking user:", error);
      toast({
        title: "Error",
        description: "Failed to verify user session",
        variant: "destructive",
      });
    }
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      console.log("Fetching challenges with filters:", {
        filter,
        status,
        sortBy,
      });

      // Build query parameters
      const params = new URLSearchParams();
      if (filter !== "all") params.append("type", filter);
      if (status !== "all") params.append("status", status);
      params.append("sort", sortBy);

      const response = await fetch(`/api/challenges?${params.toString()}`);
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

      // Apply client-side filtering if needed
      let filteredData = [...data];

      // Filter by type if not already filtered by server
      if (filter !== "all") {
        filteredData = filteredData.filter(
          (challenge) => challenge.type === filter
        );
      }

      // Filter by status if not already filtered by server
      if (status !== "all") {
        filteredData = filteredData.filter(
          (challenge) => challenge.status === status
        );
      }

      // Sort if not already sorted by server
      if (sortBy === "date") {
        filteredData.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortBy === "participants") {
        filteredData.sort(
          (a, b) => (a.min_participants || 0) - (b.min_participants || 0)
        );
      }

      console.log("Filtered challenges:", filteredData.length);
      setChallenges(filteredData);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch challenges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = () => {
    router.push("/challenges/create");
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!userProfile) return;

    try {
      const { error } = await supabase.from("challenge_participants").insert({
        challenge_id: challengeId,
        user_id: userProfile.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully joined the challenge!",
      });

      // Refresh challenges to update the UI
      fetchChallenges();
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const isParticipating = (challenge: Challenge) => {
    return challenge.participants?.some((p) => p.user_id === userProfile?.id);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Browse Challenges</h1>
        <Button onClick={handleCreateChallenge}>
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Select
          value={filter}
          onValueChange={(value: FilterType) => setFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="competitive">Competitive</SelectItem>
            <SelectItem value="collaborative">Collaborative</SelectItem>
          </SelectContent>
        </Select>

        <Tabs
          value={status}
          onValueChange={(value) => setStatus(value as ChallengeStatus | "all")}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={sortBy}
          onValueChange={(value: SortType) => setSortBy(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Latest</SelectItem>
            <SelectItem value="participants">Min Participants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-xl text-muted-foreground mb-4">
            No challenges found
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {filter !== "all" || status !== "active"
              ? "Try adjusting your filters to see more challenges"
              : "Be the first to create a challenge!"}
          </p>
          <Button onClick={handleCreateChallenge} variant="outline">
            Create Challenge
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      challenge.type === "competitive" ? "default" : "secondary"
                    }
                  >
                    {challenge.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Created by:</span>{" "}
                    {challenge.creator?.username}
                  </div>
                  <div>
                    <span className="font-semibold">Start:</span>{" "}
                    {formatDate(challenge.start_date)}
                  </div>
                  <div>
                    <span className="font-semibold">End:</span>{" "}
                    {formatDate(challenge.end_date)}
                  </div>
                  <div>
                    <span className="font-semibold">Participants:</span>{" "}
                    {challenge.participants?.length || 0} /{" "}
                    {challenge.max_participants || "∞"}
                  </div>
                  <div>
                    <span className="font-semibold">Goals:</span>{" "}
                    {challenge.goals?.length || 0}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/challenges/${challenge.id}`)}
                >
                  Details
                </Button>
                {isParticipating(challenge) ? (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      router.push(`/profile/challenges/${challenge.id}`)
                    }
                  >
                    View Progress
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => handleJoinChallenge(challenge.id)}
                  >
                    Join Challenge
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
