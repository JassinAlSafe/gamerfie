"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForumHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  totalCount?: number;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
  createButtonText?: string;
  badges?: Array<{
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }>;
  className?: string;
}

export function ForumHeader({
  title,
  description,
  icon,
  totalCount,
  onCreateClick,
  showCreateButton = true,
  createButtonText = "New Thread",
  badges = [],
  className
}: ForumHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Header Content */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
                <div className="w-8 h-8 text-purple-600 dark:text-purple-400">
                  {icon}
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-slate-100 dark:via-purple-300 dark:to-slate-100 bg-clip-text text-transparent leading-tight">
                  {title}
                </h1>
                {totalCount !== undefined && (
                  <Badge 
                    variant="outline" 
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50 px-3 py-1"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {totalCount.toLocaleString()} total
                  </Badge>
                )}
                {badges.map((badge, index) => (
                  <Badge 
                    key={index}
                    variant={badge.variant || "outline"}
                    className={badge.className}
                  >
                    {badge.text}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {description && (
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        {showCreateButton && onCreateClick && (
          <Button 
            onClick={onCreateClick}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 px-6 py-3 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40 whitespace-nowrap" 
          >
            <Plus className="w-5 h-5 mr-2" />
            {createButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}