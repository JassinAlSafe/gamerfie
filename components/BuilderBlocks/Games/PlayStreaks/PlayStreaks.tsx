"use client";

import { memo, useEffect, useState, useRef } from "react";
import { Flame, Zap, Calendar, Target, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayStreaksProps {
  currentStreak?: number;
  longestStreak?: number;
  weeklyGoal?: number;
  weeklyProgress?: number;
  dailyActivity?: boolean[];
  lastPlayedDays?: number;
  className?: string;
}

export const PlayStreaks = memo(function PlayStreaks({
  currentStreak = 5,
  longestStreak = 14,
  weeklyGoal = 7,
  weeklyProgress = 4,
  dailyActivity = [true, true, false, true, true, false, true],
  lastPlayedDays: _lastPlayedDays = 0,
  className
}: PlayStreaksProps) {
  const [mounted, setMounted] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [mounted]);

  if (!mounted) {
    return <PlayStreaksSkeleton className={className} />;
  }

  const streakPercentage = Math.min((currentStreak / 30) * 100, 100);
  const weeklyPercentage = Math.min((weeklyProgress / weeklyGoal) * 100, 100);
  const isOnStreak = currentStreak > 0;
  const isHotStreak = currentStreak >= 7;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative p-4 rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm group hover:shadow-lg transition-all duration-300 h-full flex flex-col",
        className
      )}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 rounded-2xl" />
      {isHotStreak && (
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isHotStreak 
                ? "bg-gradient-to-br from-orange-400/20 to-red-500/20 animate-pulse" 
                : "bg-gradient-to-br from-orange-400/10 to-red-500/10"
            )}
          >
            <Flame className={cn(
              "h-5 w-5",
              isHotStreak ? "text-orange-500" : "text-orange-400"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Play Streaks</h3>
            <p className="text-sm text-muted-foreground">
              {isOnStreak ? "Keep it going!" : "Start a new streak!"}
            </p>
          </div>
        </div>

        {/* Streak Badge */}
        <div
          className={cn(
            "relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all duration-300",
            isHotStreak 
              ? "border-orange-500/50 bg-gradient-to-br from-orange-500/20 to-red-500/20" 
              : "border-muted/30 bg-muted/10"
          )}
        >
          <span className={cn(
            "text-lg font-bold",
            isHotStreak 
              ? "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent" 
              : "text-foreground"
          )}>
            {currentStreak}
          </span>
          <span className="text-xs text-muted-foreground">days</span>
          
          {isHotStreak && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-spin">
              <Zap className="h-2 w-2 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Last 7 Days
          </h4>
          <span className="text-xs text-muted-foreground">
            {dailyActivity.filter(Boolean).length}/7 days active
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {dailyActivity.map((isActive, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square rounded-lg border transition-all duration-200 flex items-center justify-center text-xs font-medium",
                isActive 
                  ? "bg-gradient-to-br from-orange-400 to-red-500 border-orange-500/30 text-white shadow-sm" 
                  : "bg-muted/20 border-muted/30 text-muted-foreground hover:bg-muted/40"
              )}
              title={`Day ${index + 1} - ${isActive ? "Active" : "Inactive"}`}
            >
              {isActive && <Flame className="h-3 w-3" />}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 flex-shrink-0">
        <StatItem
          icon={<Award className="h-4 w-4" />}
          label="Best Streak"
          value={`${longestStreak} days`}
          color="text-purple-500"
          progress={Math.min((longestStreak / 30) * 100, 100)}
        />
        <StatItem
          icon={<Target className="h-4 w-4" />}
          label="Weekly Goal"
          value={`${weeklyProgress}/${weeklyGoal}h`}
          color="text-emerald-500"
          progress={weeklyPercentage}
        />
      </div>

      {/* Streak Progress */}
      <div className="space-y-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Streak Progress</span>
          <span>{currentStreak}/30 days</span>
        </div>
        <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
              isHotStreak 
                ? "bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 shadow-sm" 
                : "bg-gradient-to-r from-orange-400 to-red-500"
            )}
            style={{ width: `${streakPercentage}%` }}
          />
          {isHotStreak && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
          )}
        </div>
      </div>

      {/* Milestone Indicators */}
      <div className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-border/30 flex-shrink-0">
        {[3, 7, 14, 21, 30].map((milestone) => (
          <div
            key={milestone}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentStreak >= milestone 
                ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-sm" 
                : "bg-muted/30"
            )}
            title={`${milestone} day milestone`}
          />
        ))}
      </div>

      {/* Motivational Message */}
      {isHotStreak && containerSize.height > 300 && (
        <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 flex-shrink-0 opacity-0 animate-fade-in">
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="h-3 w-3 text-orange-500" />
            <span className="font-medium text-orange-600">
              You're on fire! 🔥 {currentStreak} day streak!
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

// Stat item component
const StatItem = memo(function StatItem({
  icon,
  label,
  value,
  color,
  progress
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  progress: number;
}) {
  return (
    <div className="text-center">
      <div className={cn("flex items-center justify-center mb-2", color)}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-current to-current opacity-60 rounded-full transition-all duration-800 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});

// Loading skeleton
const PlayStreaksSkeleton = memo(function PlayStreaksSkeleton({
  className
}: {
  className?: string;
}) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border border-border/30 bg-card/50 animate-pulse",
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-muted/20 rounded-lg" />
          <div className="space-y-1">
            <div className="w-24 h-4 bg-muted/20 rounded" />
            <div className="w-20 h-3 bg-muted/20 rounded" />
          </div>
        </div>
        <div className="w-16 h-16 bg-muted/20 rounded-2xl" />
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="w-20 h-3 bg-muted/20 rounded" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted/20 rounded-lg" />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="text-center space-y-2">
            <div className="w-4 h-4 bg-muted/20 rounded mx-auto" />
            <div className="w-8 h-4 bg-muted/20 rounded mx-auto" />
            <div className="w-12 h-3 bg-muted/20 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
});