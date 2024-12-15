"use client";

import React from "react";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 relative flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full absolute inset-0 h-screen">
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

      <div className="relative z-10 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-8"
        >
          Track Your Gaming Journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 max-w-lg mx-auto text-lg mb-12"
        >
          Join a community of gamers, track your progress, and discover new
          games. Your gaming adventure starts here.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <FeatureCard
            title="Track Progress"
            description="Keep track of your gaming achievements, completion status, and playtime."
            delay={0.8}
          />
          <FeatureCard
            title="Discover Games"
            description="Find new games based on your interests and what's trending in the community."
            delay={1}
          />
          <FeatureCard
            title="Connect"
            description="Join a community of gamers, share experiences, and make new friends."
            delay={1.2}
          />
        </motion.div>
      </div>

      <BackgroundBeams />
    </div>
  );
}

function FeatureCard({
  title,
  description,
  delay,
}: {
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      <div className="relative p-6 bg-gray-900 ring-1 ring-gray-800/50 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
}
