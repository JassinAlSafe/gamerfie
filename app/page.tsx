"use client";

import React from "react";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Users,
  Trophy,
  Star,
  Activity,
  Sparkles,
  Zap,
  BarChart3,
} from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

const features = [
  {
    title: "Track Your Games",
    description:
      "Keep track of your gaming achievements, completion status, and playtime across your entire library.",
    icon: <Gamepad2 className="h-10 w-10 text-purple-500" />,
    link: "/explore",
  },
  {
    title: "Community Stats",
    description:
      "See what games are trending, most completed, and highest rated in the community.",
    icon: <BarChart3 className="h-10 w-10 text-pink-500" />,
    link: "/explore",
  },
  {
    title: "Achievement Tracking",
    description:
      "Track your gaming milestones and compare with friends. Never miss an achievement.",
    icon: <Trophy className="h-10 w-10 text-yellow-500" />,
    link: "/explore",
  },
  {
    title: "Connect with Gamers",
    description:
      "Join a vibrant community of gamers, share experiences, and make new friends.",
    icon: <Users className="h-10 w-10 text-cyan-500" />,
    link: "/explore",
  },
  {
    title: "Trending Games",
    description:
      "Discover what's hot in the gaming world with our curated lists and recommendations.",
    icon: <Zap className="h-10 w-10 text-orange-500" />,
    link: "/explore",
  },
  {
    title: "Game Ratings",
    description:
      "Rate games you've played and see what others think. Find your next favorite game.",
    icon: <Star className="h-10 w-10 text-green-500" />,
    link: "/explore",
  },
];

const stats = [
  { label: "Active Gamers", value: "10K+" },
  { label: "Games Tracked", value: "50K+" },
  { label: "Reviews Written", value: "100K+" },
  { label: "Achievements Unlocked", value: "1M+" },
];

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-gray-950 relative flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative">
        <TracingBeam className="px-6">
          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="relative flex flex-col items-center justify-center min-h-screen text-center py-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto mb-12"
              >
                <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-8">
                  Track Your Gaming Journey
                </h1>
                <TextGenerateEffect
                  words="Join a community of gamers, track your progress, and discover new games. Your gaming adventure starts here."
                  className="text-gray-400 text-lg mb-12"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-24"
              >
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="bg-purple-500 hover:bg-purple-600 text-white min-w-[200px]"
                  >
                    Explore Games
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-500 text-purple-500 hover:bg-purple-500/10 min-w-[200px]"
                  >
                    Get Started
                  </Button>
                </Link>
              </motion.div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 mt-2">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features Section with Hover Effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="py-24"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                Everything You Need
              </h2>
              <HoverEffect items={features} />
            </motion.div>
          </div>
        </TracingBeam>
      </main>

      <BackgroundBeams className="opacity-20" />
    </div>
  );
}
