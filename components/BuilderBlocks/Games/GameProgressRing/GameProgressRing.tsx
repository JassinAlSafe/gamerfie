"use client";

import { memo, useEffect, useState, useRef } from "react";
import { Trophy, Target, Zap, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameProgressRingProps {
  completedGames?: number;
  totalGames?: number;
  totalPlaytime?: number;
  weeklyGoal?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const GameProgressRing = memo(function GameProgressRing({
  completedGames = 12,
  totalGames = 24,
  totalPlaytime = 8.5,
  weeklyGoal = 10,
  className,
  size = "md"
}: GameProgressRingProps) {
  const [mounted, setMounted] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Animate the progress ring
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 300);
    return () => clearTimeout(timer);
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
    return <GameProgressRingSkeleton size={size} className={className} />;
  }

  const completionRate = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;
  const weeklyProgress = Math.min((totalPlaytime / weeklyGoal) * 100, 100);
  
  // Calculate optimal ring size based on container
  const calculateRingSize = () => {
    if (!mounted || !containerSize.width || !containerSize.height) {
      return { ring: 100, stroke: 6, center: 50 };
    }
    
    // Reserve space for padding (32px), stats grid (80px), and achievement indicators (60px)
    const reservedHeight = 32 + 80 + 60;
    const availableHeight = containerSize.height - reservedHeight;
    const availableWidth = containerSize.width - 32;
    
    // Use the smaller dimension to ensure the ring fits
    const maxRingSize = Math.min(availableHeight, availableWidth);
    const ring = Math.max(70, Math.min(maxRingSize, 120));
    const stroke = Math.max(4, Math.min(ring * 0.06, 8));
    const center = ring / 2;
    
    return { ring, stroke, center };
  };

  const sizes = {
    sm: { ring: 80, stroke: 6, center: 40 },
    md: calculateRingSize(),
    lg: { ring: 160, stroke: 10, center: 80 }
  };

  const { ring, stroke, center } = sizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference * animationProgress;
  const weeklyStrokeDashoffset = circumference - (weeklyProgress / 100) * circumference * animationProgress;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm group hover:shadow-lg transition-all duration-300 h-full",
        className
      )}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl" />
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Main Progress Ring */}
      <div className="relative mb-3 flex-shrink-0 flex items-center justify-center">
        <svg width={ring} height={ring} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-muted/20"
          />
          
          {/* Weekly goal ring (outer) */}
          <circle
            cx={center}
            cy={center}
            r={Math.max(radius - 4, radius * 0.85)}
            stroke="currentColor"
            strokeWidth={3}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={weeklyStrokeDashoffset}
            strokeLinecap="round"
            className="text-emerald-500/60 transition-all duration-1000 ease-out"
          />
          
          {/* Completion ring (main) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out filter drop-shadow-sm"
            style={{
              strokeDashoffset: strokeDashoffset,
            }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="h-3 w-3 text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                {completionRate.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Complete</p>
          </div>
        </div>

        {/* Floating indicators */}
        {completionRate > 75 && (
          <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Zap className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 w-full flex-1 min-h-0">
        <StatItem
          icon={<Target className="h-4 w-4" />}
          label="Completed"
          value={completedGames}
          subValue={`of ${totalGames}`}
          color="text-purple-500"
        />
        <StatItem
          icon={<Clock className="h-4 w-4" />}
          label="This Week"
          value={`${totalPlaytime}h`}
          subValue={`Goal: ${weeklyGoal}h`}
          color="text-emerald-500"
          progress={weeklyProgress}
        />
      </div>

      {/* Achievement Indicators */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30 w-full flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>
            {completionRate > 50 ? "Great progress!" : 
             completionRate > 25 ? "Keep going!" : 
             "Just getting started!"}
          </span>
        </div>
        <div className="flex gap-1 ml-auto">
          {[25, 50, 75, 90].map((milestone) => (
            <div
              key={milestone}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                completionRate >= milestone 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-sm" 
                  : "bg-muted/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// Stat item component
const StatItem = memo(function StatItem({
  icon,
  label: _label,
  value,
  subValue,
  color,
  progress
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue: string;
  color: string;
  progress?: number;
}) {
  return (
    <div className="text-center flex flex-col justify-center h-full">
      <div className={cn("flex items-center justify-center mb-1", color)}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-foreground leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground leading-tight">{subValue}</p>
      {progress !== undefined && (
        <div className="mt-1 h-1 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-800 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
});

// Loading skeleton
const GameProgressRingSkeleton = memo(function GameProgressRingSkeleton({
  size: _size = "md",
  className
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 rounded-2xl border border-border/30 bg-card/50 animate-pulse",
      className
    )}>
      <div className="w-24 h-24 bg-muted/20 rounded-full mb-4" />
      <div className="grid grid-cols-2 gap-4 w-full">
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