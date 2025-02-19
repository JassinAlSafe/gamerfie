"use client";

import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function AnimatedHeroContent() {
  return (
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
  );
}

export function AnimatedCallToAction() {
  return (
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
  );
}
