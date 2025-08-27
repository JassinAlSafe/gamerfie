"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ForumStatsCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function ForumStatsCard({
  icon,
  value,
  label,
  iconColor = "text-blue-500",
  trend,
  className
}: ForumStatsCardProps) {
  return (
    <Card className={cn(
      "group bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/90 dark:hover:bg-slate-900/90 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Icon Container */}
          <div className={cn(
            "flex-shrink-0 p-3 rounded-xl bg-gradient-to-br transition-all duration-300 group-hover:scale-110",
            iconColor === "text-blue-500" && "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30",
            iconColor === "text-green-500" && "from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30",
            iconColor === "text-purple-500" && "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30",
            iconColor === "text-orange-500" && "from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30"
          )}>
            <div className={cn("w-6 h-6", iconColor)}>
              {icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {value.toLocaleString()}
              </p>
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  trend.isPositive 
                    ? "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30" 
                    : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              {label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}