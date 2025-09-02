"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ProfileStatsBar } from "./ProfileContentSection";

interface ProfilePageAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
}

interface ProfilePageStat {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}

interface ProfilePageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ProfilePageAction[];
  stats?: ProfilePageStat[];
  statsComponent?: React.ReactNode; // For complex stats like ReviewStatsCard
  className?: string;
}

export function ProfilePageHeader({
  title,
  subtitle,
  actions = [],
  stats = [],
  statsComponent,
  className = ""
}: ProfilePageHeaderProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Optional Enhanced Stats Component */}
      {statsComponent && (
        <div>{statsComponent}</div>
      )}

      {/* Standard Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            {title}
            {subtitle && (
              <span className="text-lg font-normal text-gray-400 ml-2">
                {subtitle}
              </span>
            )}
          </h1>
          
          {/* Simple Stats Bar */}
          {stats.length > 0 && (
            <ProfileStatsBar stats={stats} />
          )}
        </div>
        
        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || "outline"}
                className="border-gray-700/50 hover:bg-gray-800/50 min-h-[44px]"
                aria-label={action.label}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}