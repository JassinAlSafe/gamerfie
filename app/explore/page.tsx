"use client";

import React from "react";
import PopularGamesSection from "@/components/PopularGamesSection";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Hero Section */}
      <div className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Discover Your Next Gaming Adventure
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">
              Explore trending games, connect with fellow gamers, and keep track of your gaming journey.
              Join our community of passionate players and discover new experiences.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                <Search className="mr-2 h-5 w-5" />
                Search Games
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Categories */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-7xl">
          <PopularGamesSection />
        </div>
      </div>

      {/* Community Section */}
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 bg-black/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Join the Gaming Community
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Connect with other gamers, share your experiences, and discover new gaming perspectives.
                Track your progress, write reviews, and build your gaming profile.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  Get Started
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg"></div>
                <div className="h-64 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg"></div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg"></div>
                <div className="h-48 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 