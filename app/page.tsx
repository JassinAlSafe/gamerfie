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
  Zap,
  BarChart3,
} from "lucide-react";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import homeData from "./data/home.json";

const iconMap = {
  Gamepad2,
  BarChart3,
  Trophy,
  Users,
  Zap,
  Star,
};

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-gray-950 relative font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <SparklesCore
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen py-32 px-4 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl space-y-6"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500">
              Track Your Gaming Journey
            </h1>
            <TextGenerateEffect
              words="Join a community of gamers, track your progress, and discover new games. Your gaming adventure starts here."
              className="text-gray-400 text-lg sm:text-xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 mt-6"
          >
            <Link href="/explore">
              <Button
                size="lg"
                className="bg-purple-500 hover:bg-purple-600 text-white min-w-[200px] h-14"
              >
                Explore Games
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-500 text-purple-500 hover:bg-purple-500/10 min-w-[200px] h-14"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>

          {/* Stats Section */}
          <div className="mt-16 w-full max-w-6xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
              {homeData.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="bg-gray-900/50 rounded-xl p-6 text-center backdrop-blur-md"
                >
                  <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm sm:text-lg">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-gray-950 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-16">
                Everything You Need
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {homeData.features.map((feature) => {
                  const Icon = iconMap[feature.icon as keyof typeof iconMap];
                  return (
                    <HoverEffect key={feature.title}>
                      <Link href={feature.link} className="block h-full p-6">
                        <div className="flex flex-col items-center text-center">
                          <Icon className={`h-12 w-12 ${feature.iconColor}`} />
                          <h3 className="mt-4 text-xl font-semibold text-white">
                            {feature.title}
                          </h3>
                          <p className="mt-2 text-gray-400">
                            {feature.description}
                          </p>
                        </div>
                      </Link>
                    </HoverEffect>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <BackgroundBeams className="opacity-20 z-0" />
    </div>
  );
}
