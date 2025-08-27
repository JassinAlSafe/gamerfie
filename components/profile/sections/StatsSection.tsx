import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, Gamepad2, Star, Clock, Award } from "lucide-react";
import { UserStats } from "@/types/stats";
import { cn } from "@/lib/utils";

interface StatsSectionProps {
  stats: UserStats | null;
  isLoading: boolean;
  onRefresh: () => void;
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  description?: string;
}

const StatItem = memo<StatItemProps>(({ icon: Icon, label, value, color, bgColor, description }) => (
  <div className="group">
    <div className={cn(
      "flex items-center space-x-3 p-3 rounded-xl transition-all duration-200",
      "hover:bg-white/5 cursor-default"
    )}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgColor)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 font-medium tracking-wide">{label}</span>
          <span className="text-lg font-semibold text-white tabular-nums">{value}</span>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  </div>
));

StatItem.displayName = 'StatItem';

export const StatsSection = memo<StatsSectionProps>(({ 
  stats, 
  isLoading: _isLoading, 
  onRefresh 
}) => {
  const formatPlaytime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  return (
    <Card className={cn(
      "glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl",
      "hover:border-gray-600/40 transition-all duration-300 group"
    )}>
      <CardContent className="p-6">
        {/* Section Header with Apple-inspired design */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Statistics</h3>
              <p className="text-xs text-gray-500 mt-0.5">Your gaming insights</p>
            </div>
          </div>
          
          {/* Refresh button with subtle design */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className={cn(
              "profile-nav-item touch-feedback",
              "h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10",
              "transition-all duration-200 rounded-lg"
            )}
            aria-label="Refresh statistics"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        {stats ? (
          <div className="space-y-1">
            {/* Primary stats with visual hierarchy */}
            <StatItem
              icon={Gamepad2}
              label="Total Games"
              value={stats.total_games}
              color="text-blue-400"
              bgColor="bg-blue-500/20"
              description="Games in your collection"
            />
            
            <StatItem
              icon={Award}
              label="Completed"
              value={stats.completed_games}
              color="text-green-400"
              bgColor="bg-green-500/20"
              description={`${((stats.completed_games / Math.max(stats.total_games, 1)) * 100).toFixed(0)}% completion rate`}
            />
            
            <StatItem
              icon={Star}
              label="Average Rating"
              value={stats.avg_rating ? `${stats.avg_rating.toFixed(1)}★` : "—"}
              color="text-yellow-400"
              bgColor="bg-yellow-500/20"
              description="Your average game rating"
            />
            
            <StatItem
              icon={Clock}
              label="Total Playtime"
              value={formatPlaytime(stats.total_playtime || 0)}
              color="text-purple-400"
              bgColor="bg-purple-500/20"
              description="Time spent gaming"
            />
            
            {/* Separator for secondary stats */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent my-4" />
            
            {/* Secondary stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-lg font-semibold text-white tabular-nums">
                  {stats.journal?.total_reviews || 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">Reviews</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-lg font-semibold text-white tabular-nums">
                  {stats.journal?.total_entries || 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">Journal Entries</div>
              </div>
            </div>
          </div>
        ) : (
          /* Loading/empty state */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-gray-500 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-medium tracking-tight">
                Loading Statistics
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Analyzing your gaming data...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

StatsSection.displayName = 'StatsSection';