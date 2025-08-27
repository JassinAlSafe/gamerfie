"use client";

import React, { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";

// Extended User type that includes profile (same as auth store)
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type User = SupabaseUser & {
  profile?: Profile | null;
};

interface WelcomeHeaderProps {
  user: User;
  totalGames?: number;
  weeklyPlaytime?: number;
  currentStreak?: number;
  className?: string;
  isNewUser?: boolean;
}

export const WelcomeHeader = memo(function WelcomeHeader({
  user,
  totalGames = 0,
  weeklyPlaytime = 0,
  currentStreak = 0,
  className,
  isNewUser = false,
}: WelcomeHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <WelcomeHeaderSkeleton className={className} />;
  }

  const hour = currentTime.getHours();
  // Get display_name from the user's profile (stored in profiles table)
  // user.profile comes from the auth store which fetches the full profile
  // Using type assertion since display_name exists in DB but not in generated types
  const username =
    (user.profile as any)?.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Gamer";
  const { greeting } = getTimeBasedContent(hour);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/20",
        "bg-gradient-to-br from-card/30 to-card/10 backdrop-blur-sm",
        className
      )}
    >

      <div className="relative px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Simplified Welcome Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-1"
            >
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {isNewUser ? "Welcome to GameVault" : greeting}, {username}
              </h1>
              <p className="text-muted-foreground">
                {isNewUser ? "Your gaming journey starts here" : "Ready to start gaming?"}
              </p>
            </motion.div>
          </div>

          {/* Single Key Stat */}
          {totalGames > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-right"
            >
              <div className="text-2xl font-semibold text-foreground">{totalGames}</div>
              <div className="text-sm text-muted-foreground">Games</div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
});



// Helper function to get time-based content
function getTimeBasedContent(hour: number) {
  if (hour >= 5 && hour < 12) {
    return { greeting: "Good morning" };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: "Good afternoon" };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: "Good evening" };
  } else {
    return { greeting: hour < 5 ? "Good night" : "Good evening" };
  }
}


// Loading skeleton
const WelcomeHeaderSkeleton = memo(function WelcomeHeaderSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/20 bg-gradient-to-br from-muted/30 to-muted/10 px-8 py-6 animate-pulse",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="space-y-1">
            <div className="w-48 h-7 bg-muted/30 rounded" />
            <div className="w-32 h-4 bg-muted/30 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="w-12 h-7 bg-muted/30 rounded mb-1" />
          <div className="w-12 h-4 bg-muted/30 rounded" />
        </div>
      </div>
    </div>
  );
});
