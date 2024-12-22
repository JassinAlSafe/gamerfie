"use client";

import { useEffect } from "react";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { ChallengeList } from "@/components/Challenges/ChallengeList";
import { Button } from "@/components/ui/button";
import { Plus, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";

export default function ChallengesPage() {
  const { fetchChallenges } = useChallengesStore();

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return (
    <div className="relative min-h-screen pt-20">
      <BackgroundBeams className="absolute top-0 left-0 w-full h-full" />

      {/* Hero Section */}
      <div className="relative w-full flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="absolute inset-0 w-full h-48">
          <SparklesCore
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#7c3aed"
          />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Gamepad2 className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Community Challenges</h1>
          </div>

          <div className="max-w-2xl mx-auto text-gray-400 text-lg">
            <TextGenerateEffect words="Join forces with fellow gamers, compete in exciting challenges, and earn rewards for your achievements." />
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Link href="/challenges/create">
              <Button className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20">
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <ChallengeList />
      </div>
    </div>
  );
}
