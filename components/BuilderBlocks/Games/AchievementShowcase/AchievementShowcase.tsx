"use client";

import { memo, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Award, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt: Date;
  progress?: number;
  isNew?: boolean;
}

interface AchievementShowcaseProps {
  achievements?: Achievement[];
  totalAchievements?: number;
  recentAchievements?: Achievement[];
  className?: string;
}

// Mock data for when no props are provided
const mockAchievements: Achievement[] = [
  {
    id: "1",
    name: "First Steps",
    description: "Complete your first game",
    rarity: "common",
    unlockedAt: new Date(Date.now() - 86400000), // 1 day ago
    isNew: true
  },
  {
    id: "2", 
    name: "Speed Runner",
    description: "Complete a game in under 10 hours",
    rarity: "rare",
    unlockedAt: new Date(Date.now() - 172800000) // 2 days ago
  },
  {
    id: "3",
    name: "Game Master",
    description: "Achieve 100% completion",
    rarity: "epic", 
    unlockedAt: new Date(Date.now() - 604800000) // 1 week ago
  }
];

export const AchievementShowcase = memo(function AchievementShowcase({
  achievements = mockAchievements,
  totalAchievements = 50,
  recentAchievements = mockAchievements,
  className
}: AchievementShowcaseProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
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
    return <AchievementShowcaseSkeleton className={className} />;
  }

  const unlockedCount = achievements?.length || 0;
  const completionRate = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;
  const recentUnlocked = (recentAchievements || []).slice(0, 3);


  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative p-4 rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm group hover:shadow-lg transition-all duration-300 h-full flex flex-col",
        className
      )}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5 rounded-2xl" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-500/20">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Achievements</h3>
            <p className="text-sm text-muted-foreground">
              {unlockedCount} of {totalAchievements} unlocked
            </p>
          </div>
        </div>
        
        {/* Completion Ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-muted/20"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="url(#achievementGradient)"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 - (completionRate / 100) * 125.6}
              strokeLinecap="round"
              style={{
                transition: mounted ? 'stroke-dashoffset 1s ease-out' : 'none'
              }}
            />
            <defs>
              <linearGradient id="achievementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-yellow-600">
              {completionRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="space-y-2 mb-3 flex-1 min-h-0 overflow-hidden">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Recently Unlocked
        </h4>
        
        <AnimatePresence mode="popLayout">
          {recentUnlocked.length > 0 ? (
            recentUnlocked.slice(0, containerSize.height > 350 ? 3 : 2).map((achievement, index) => (
              <AchievementItem
                key={achievement.id}
                achievement={achievement}
                index={index}
                onClick={() => setSelectedAchievement(achievement)}
                isCompact={containerSize.height <= 350}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4 text-sm text-muted-foreground"
            >
              No recent achievements
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <Link
        href="/achievements"
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm font-medium text-muted-foreground hover:text-foreground flex-shrink-0"
      >
        View All Achievements
        <ChevronRight className="h-4 w-4" />
      </Link>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <AchievementDetail achievement={selectedAchievement} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Achievement Item Component
const AchievementItem = memo(function AchievementItem({
  achievement,
  index,
  onClick,
  isCompact = false
}: {
  achievement: Achievement;
  index: number;
  onClick: () => void;
  isCompact?: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const RarityIcon = getRarityIcon(achievement.rarity);
  
  // Render without animation on server/initial load
  if (!isMounted) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 cursor-pointer group border border-transparent hover:border-border/50",
          isCompact ? "p-2" : "p-3"
        )}
      >
        <div className={cn(
          "rounded-lg bg-gradient-to-br",
          getRarityColor(achievement.rarity),
          isCompact ? "p-1.5" : "p-2"
        )}>
          <RarityIcon className={cn("text-white", isCompact ? "h-3 w-3" : "h-4 w-4")} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn("font-medium text-foreground truncate", isCompact ? "text-xs" : "text-sm")}>
              {achievement.name}
            </p>
            {achievement.isNew && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-medium text-white">
                <Sparkles className="h-3 w-3" />
                NEW
              </div>
            )}
          </div>
          {!isCompact && (
            <p className="text-xs text-muted-foreground truncate">
              {achievement.description}
            </p>
          )}
        </div>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 cursor-pointer group border border-transparent hover:border-border/50",
        isCompact ? "p-2" : "p-3"
      )}
    >
      <div className={cn(
        "rounded-lg bg-gradient-to-br",
        getRarityColor(achievement.rarity),
        isCompact ? "p-1.5" : "p-2"
      )}>
        <RarityIcon className={cn("text-white", isCompact ? "h-3 w-3" : "h-4 w-4")} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("font-medium text-foreground truncate", isCompact ? "text-xs" : "text-sm")}>
            {achievement.name}
          </p>
          {achievement.isNew && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-medium text-white">
              <Sparkles className="h-3 w-3" />
              NEW
            </div>
          )}
        </div>
        {!isCompact && (
          <p className="text-xs text-muted-foreground truncate">
            {achievement.description}
          </p>
        )}
      </div>
      
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </motion.div>
  );
});

// Achievement Detail Component
const AchievementDetail = memo(function AchievementDetail({
  achievement
}: {
  achievement: Achievement;
}) {
  const RarityIcon = getRarityIcon(achievement.rarity);
  
  return (
    <div className="text-center">
      <div className={cn(
        "inline-flex p-4 rounded-2xl bg-gradient-to-br mb-4",
        getRarityColor(achievement.rarity)
      )}>
        <RarityIcon className="h-8 w-8 text-white" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {achievement.name}
      </h3>
      
      <p className="text-muted-foreground mb-4">
        {achievement.description}
      </p>
      
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="capitalize font-medium text-yellow-600">
          {achievement.rarity}
        </span>
        <span>•</span>
        <span>
          Unlocked {achievement.unlockedAt.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
});

// Helper functions
const getRarityColor = (rarity: Achievement["rarity"]) => {
  switch (rarity) {
    case "common": return "from-gray-400 to-gray-600";
    case "rare": return "from-blue-400 to-blue-600";
    case "epic": return "from-purple-400 to-purple-600";
    case "legendary": return "from-yellow-400 to-orange-500";
    default: return "from-gray-400 to-gray-600";
  }
};

const getRarityIcon = (rarity: Achievement["rarity"]) => {
  switch (rarity) {
    case "common": return Star;
    case "rare": return Award;
    case "epic": return Trophy;
    case "legendary": return Sparkles;
    default: return Star;
  }
};

// Loading skeleton
const AchievementShowcaseSkeleton = memo(function AchievementShowcaseSkeleton({
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
        <div className="w-12 h-12 bg-muted/20 rounded-full" />
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10">
            <div className="w-8 h-8 bg-muted/20 rounded-lg" />
            <div className="flex-1 space-y-1">
              <div className="w-24 h-4 bg-muted/20 rounded" />
              <div className="w-32 h-3 bg-muted/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});