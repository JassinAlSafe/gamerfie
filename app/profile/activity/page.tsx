"use client";

import React, { useMemo } from "react";
import { useProfile } from "@/hooks/Profile/use-profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { FriendActivityFeed } from "@/components/friends/friend-activity-feed";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { Activity, AlertCircle, RefreshCw } from "lucide-react";

export default function ActivityPage() {
  const { profile, isLoading, error, gameStats } = useProfile();
  const router = useRouter();
  
  // Memoize the stats transformation to prevent unnecessary re-renders
  const profileStats = useMemo(() => {
    if (gameStats) {
      return {
        ...gameStats,
        totalGames: gameStats.total_played,
        totalPlaytime: 0,
        recentlyPlayed: [],
        mostPlayed: []
      };
    }
    
    return {
      total_played: 0,
      played_this_year: 0,
      backlog: 0,
      totalGames: 0,
      totalPlaytime: 0,
      recentlyPlayed: [],
      mostPlayed: []
    };
  }, [gameStats]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-950">
        {/* Loading skeleton */}
        <div className="absolute inset-x-0 top-16 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950 animate-pulse" />
        
        <div className="relative flex flex-col flex-grow">
          {/* Profile header skeleton */}
          <div className="pt-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-800 rounded-full animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation skeleton */}
          <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gray-800 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="flex-grow">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5 space-y-6">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-gray-800 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (error instanceof Error && error.message === "No authenticated user") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4"
        >
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-4 border border-blue-500/20">
              <Activity className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white text-center">
            Sign In Required
          </h1>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            Please sign in to view your activity feed and connect with friends.
          </p>
          <Button
            onClick={() => router.push("/signin")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In to Continue
          </Button>
        </motion.div>
      );
    }
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4"
      >
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-4 border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-white text-center">
          Something went wrong
        </h1>
        <p className="text-red-400 mb-8 text-center max-w-md">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400 hover:text-red-300"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4"
      >
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 bg-gray-500/20 rounded-full blur-xl"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-4 border border-gray-500/20">
            <Activity className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-white text-center">
          Profile Not Found
        </h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          We couldn't find your profile. Please try refreshing the page.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="bg-gray-700/50 border-gray-600 hover:bg-gray-600 text-gray-300 hover:text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Page
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Hero Section with Gradient */}
      <div className="absolute inset-x-0 top-16 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />

      {/* Main Content Container */}
      <div className="relative flex flex-col flex-grow">
        {/* Profile Header Section */}
        <div className="pt-8">
          <Toaster position="top-center" />
          <div className="max-w-7xl mx-auto px-4">
            <ProfileHeader
              profile={profile}
              stats={profileStats}
              onProfileUpdate={() => {}}
            />
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileNav />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
                  <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-3 border border-purple-500/20">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
                  <p className="text-gray-400 text-sm">Stay connected with your gaming community</p>
                </div>
              </div>
              <FriendActivityFeed />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
