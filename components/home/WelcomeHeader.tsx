"use client";

import React, { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Gamepad2,
  Star,
  Zap,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";
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
}

export const WelcomeHeader = memo(function WelcomeHeader({
  user,
  totalGames = 0,
  weeklyPlaytime = 0,
  currentStreak = 0,
  className,
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
  const {
    greeting,
    icon: TimeIcon,
    color,
    bgGradient,
    message,
  } = getTimeBasedContent(hour);
  const quickStats = getQuickStats(totalGames, weeklyPlaytime, currentStreak);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/30 backdrop-blur-sm",
        bgGradient,
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-[0.05] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/3 rounded-full blur-2xl" />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          {/* Main Welcome Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-2"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className={cn("p-2 rounded-lg", color.bg)}
              >
                <TimeIcon className={cn("h-6 w-6", color.text)} />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {greeting}, {username}!
                </h1>
                <p className="text-white/80 text-sm">{message}</p>
              </div>
            </motion.div>

            {/* Current Time & Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 text-white/70 text-sm"
            >
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {currentTime.toLocaleDateString([], {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3"
          >
            <AnimatePresence mode="popLayout">
              {quickStats.map((stat, index) => (
                <QuickStatBadge key={stat.key} stat={stat} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Progress Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 grid grid-cols-3 gap-4"
        >
          <ProgressIndicator
            label="Library Growth"
            value={totalGames}
            max={100}
            icon={<Gamepad2 className="h-4 w-4" />}
            color="from-blue-400 to-cyan-400"
          />
          <ProgressIndicator
            label="Weekly Playtime"
            value={weeklyPlaytime}
            max={40}
            icon={<TrendingUp className="h-4 w-4" />}
            color="from-green-400 to-emerald-400"
            suffix="h"
          />
          <ProgressIndicator
            label="Current Streak"
            value={currentStreak}
            max={30}
            icon={<Zap className="h-4 w-4" />}
            color="from-orange-400 to-red-400"
            suffix=" days"
          />
        </motion.div>
      </div>
    </motion.div>
  );
});

// Quick stat badge component
const QuickStatBadge = memo(
  React.forwardRef<
    HTMLDivElement,
    {
      stat: {
        key: string;
        label: string;
        value: string | number;
        icon: React.ReactNode;
        color: string;
      };
      index: number;
    }
  >(function QuickStatBadge({ stat, index }, ref) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: index * 0.1 }}
        className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors"
      >
        <div className={cn("p-1.5 rounded-lg mb-2", stat.color)}>
          {stat.icon}
        </div>
        <span className="text-white font-semibold text-sm">{stat.value}</span>
        <span className="text-white/70 text-xs">{stat.label}</span>
      </motion.div>
    );
  })
);

// Progress indicator component
const ProgressIndicator = memo(function ProgressIndicator({
  label,
  value,
  max,
  icon,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-white/80">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className="text-white text-sm font-semibold">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full bg-gradient-to-r", color)}
        />
      </div>
    </div>
  );
});

// Helper function to get time-based content
function getTimeBasedContent(hour: number) {
  if (hour >= 5 && hour < 12) {
    return {
      greeting: "Good morning",
      icon: hour < 7 ? Sunrise : Sun,
      color: {
        text: "text-yellow-400",
        bg: "bg-yellow-400/20",
      },
      bgGradient:
        "bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-red-500/5",
      message: "Ready to start your gaming day?",
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: "Good afternoon",
      icon: Sun,
      color: {
        text: "text-blue-400",
        bg: "bg-blue-400/20",
      },
      bgGradient:
        "bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-teal-500/5",
      message: "Perfect time for some gaming!",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: "Good evening",
      icon: Sunset,
      color: {
        text: "text-orange-400",
        bg: "bg-orange-400/20",
      },
      bgGradient:
        "bg-gradient-to-br from-orange-500/20 via-red-500/10 to-pink-500/5",
      message: "Time to unwind with your favorite games",
    };
  } else {
    return {
      greeting: hour < 5 ? "Good night" : "Good evening",
      icon: hour < 5 ? Moon : Star,
      color: {
        text: "text-purple-400",
        bg: "bg-purple-400/20",
      },
      bgGradient:
        "bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/5",
      message:
        hour < 5 ? "Late night gaming session?" : "Evening gaming awaits!",
    };
  }
}

// Helper function to get quick stats
function getQuickStats(
  totalGames: number,
  weeklyPlaytime: number,
  currentStreak: number
) {
  const stats = [];

  if (totalGames > 0) {
    stats.push({
      key: "games",
      label: "Games",
      value: totalGames,
      icon: <Gamepad2 className="h-4 w-4 text-white" />,
      color: "bg-blue-500/30",
    });
  }

  if (weeklyPlaytime > 0) {
    stats.push({
      key: "playtime",
      label: "Hours",
      value: `${weeklyPlaytime}h`,
      icon: <Clock className="h-4 w-4 text-white" />,
      color: "bg-green-500/30",
    });
  }

  if (currentStreak > 0) {
    stats.push({
      key: "streak",
      label: "Streak",
      value: `${currentStreak}d`,
      icon: <Zap className="h-4 w-4 text-white" />,
      color: "bg-orange-500/30",
    });
  }

  // Always show at least one stat
  if (stats.length === 0) {
    stats.push({
      key: "welcome",
      label: "Welcome",
      value: "🎮",
      icon: <Star className="h-4 w-4 text-white" />,
      color: "bg-purple-500/30",
    });
  }

  return stats;
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
        "rounded-2xl border border-border/30 bg-gradient-to-br from-muted/50 to-muted/30 p-6 animate-pulse",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-muted/30 rounded-lg" />
            <div className="space-y-1">
              <div className="w-48 h-6 bg-muted/30 rounded" />
              <div className="w-32 h-4 bg-muted/30 rounded" />
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="w-16 h-4 bg-muted/30 rounded" />
            <div className="w-20 h-4 bg-muted/30 rounded" />
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-16 h-20 bg-muted/30 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted/20 rounded-lg p-3 space-y-2">
            <div className="w-20 h-4 bg-muted/30 rounded" />
            <div className="w-full h-1.5 bg-muted/30 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
});
