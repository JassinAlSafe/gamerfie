"use client";

import React from "react";
import PopularGamesSection from "@/components/PopularGamesSection";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Calendar, Flame } from "lucide-react";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pt-20">
      <TracingBeam className="px-4">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="relative flex flex-col items-center justify-center min-h-[40vh] text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-6">
                Discover Your Next Gaming Adventure
              </h1>
              <TextGenerateEffect
                words="Explore trending games, connect with fellow gamers, and keep track of your gaming journey."
                className="text-gray-400 text-lg mb-8"
              />
              <div className="relative max-w-xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for games..."
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-400 pl-12 pr-4 py-6 rounded-2xl focus:ring-2 focus:ring-purple-500/50 text-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 text-gray-300">
                    Elden Ring
                  </Button>
                  <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 text-gray-300">
                    Final Fantasy XVI
                  </Button>
                  <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 text-gray-300">
                    Baldur's Gate 3
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Popular Lists Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Popular Lists</h2>
              <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                View All Lists
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* List cards will go here */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-white mb-3">Most Anticipated 2024</h3>
                <div className="flex flex-wrap gap-2">
                  {/* Game thumbnails */}
                  <div className="w-14 h-20 bg-gray-700 rounded-md"></div>
                  <div className="w-14 h-20 bg-gray-700 rounded-md"></div>
                  <div className="w-14 h-20 bg-gray-700 rounded-md"></div>
                  <div className="w-14 h-20 bg-gray-700 rounded-md"></div>
                </div>
              </motion.div>
              {/* Add more list cards */}
            </div>
          </div>

          {/* Game Categories */}
          <div className="space-y-12">
            {/* Popular Now */}
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-white">Popular Now</h2>
                </div>
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                  View All
                </Button>
              </div>
              <PopularGamesSection category="popular" />
            </div>

            {/* Coming Soon */}
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
                </div>
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                  View All
                </Button>
              </div>
              <PopularGamesSection category="upcoming" />
            </div>

            {/* New Releases */}
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-white">New Releases</h2>
                </div>
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                  View All
                </Button>
              </div>
              <PopularGamesSection category="new" />
            </div>
          </div>
        </div>
      </TracingBeam>
    </div>
  );
}
