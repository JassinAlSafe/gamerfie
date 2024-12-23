"use client";

import { Metadata } from "next";
import { ChallengeDetails } from "@/components/Challenges/ChallengeDetails";
import { ChallengeLeaderboard } from "@/components/Challenges/ChallengeLeaderboard";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import {
  Challenge,
  ChallengeLeaderboard as LeaderboardType,
} from "@/types/challenge";
import { ChallengeServices } from "@/lib/services/ChallengeServices";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Trophy } from "lucide-react";

interface ChallengePageProps {
  params: {
    id: string;
  };
}

function ClientChallengePage({ challengeId }: { challengeId: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardType | null>(null);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const fetchChallenge = async () => {
    try {
      setIsLoading(true);
      const data = await ChallengeServices.getChallengeById(challengeId);
      console.log("Fetched challenge data:", data);
      setChallenge(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching challenge:", err);
      setError(err instanceof Error ? err.message : "Failed to load challenge");
      setChallenge(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setIsLeaderboardLoading(true);
      const data = await ChallengeServices.getLeaderboard(challengeId);
      console.log("Fetched leaderboard data:", data);
      setLeaderboard(data);
      setLeaderboardError(null);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setLeaderboardError(
        err instanceof Error ? err.message : "Failed to load leaderboard"
      );
      setLeaderboard(null);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
    fetchLeaderboard();
  }, [challengeId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (error) {
    return (
      <div className="relative min-h-screen">
        <BackgroundBeams className="absolute top-0 left-0 w-full h-full" />
        <div className="relative container py-24 mt-16">
          <div className="max-w-md mx-auto bg-gray-800/50 border border-gray-700/50 rounded-lg p-8 text-center">
            <p className="text-red-400 text-lg">Error: {error}</p>
            <button
              onClick={fetchChallenge}
              className="mt-4 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md hover:bg-purple-500/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !challenge) {
    return (
      <div className="relative min-h-screen">
        <BackgroundBeams className="absolute top-0 left-0 w-full h-full" />
        <div className="relative container py-24 mt-16">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
            <p className="mt-4 text-gray-400">Loading challenge details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundBeams className="absolute top-0 left-0 w-full h-full opacity-50" />
      <div className="relative">
        {/* Main content */}
        <div className="container py-24 mt-16 px-6 lg:px-8">
          <div className="space-y-8">
            {/* Challenge Details */}
            <div>
              <ChallengeDetails
                challenge={challenge}
                isLoading={isLoading}
                error={error}
                onShare={handleShare}
                onChallengeUpdate={async () => {
                  await Promise.all([fetchChallenge(), fetchLeaderboard()]);
                }}
              />
            </div>

            {/* Leaderboard Section */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </div>
                  Leaderboard
                </h2>
                <div className="h-[400px] overflow-auto rounded-lg">
                  <ChallengeLeaderboard
                    challengeId={challengeId}
                    isLoading={isLeaderboardLoading}
                    error={leaderboardError}
                    rankings={leaderboard?.rankings || []}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChallengePage({ params }: ChallengePageProps) {
  return <ClientChallengePage challengeId={params.id} />;
}
