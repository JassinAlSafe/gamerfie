"use client";

import React from "react";

interface ProfileContentSectionProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Reusable content section component for profile pages
 * Provides consistent spacing and styling
 */
export function ProfileContentSection({
  children,
  className = "",
  noPadding = false
}: ProfileContentSectionProps) {
  return (
    <div className={`space-y-6 ${noPadding ? '' : 'p-0'} ${className}`}>
      {children}
    </div>
  );
}

interface ProfileEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized empty state component for profile pages
 */
export function ProfileEmptyState({
  icon,
  title,
  description,
  actions,
  className = ""
}: ProfileEmptyStateProps) {
  return (
    <div className={`text-center py-16 px-6 ${className}`}>
      {icon && (
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-8 border border-purple-500/20">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">{description}</p>
      {actions}
    </div>
  );
}

interface ProfileStatsBarProps {
  stats: Array<{
    icon?: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
  }>;
  className?: string;
}

/**
 * Reusable stats bar component for profile pages
 */
export function ProfileStatsBar({ stats, className = "" }: ProfileStatsBarProps) {
  return (
    <div className={`flex items-center gap-6 text-sm text-gray-400 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2">
          {stat.icon}
          <span>{stat.value} {stat.label}</span>
          {stat.subtext && <span className="text-gray-500">({stat.subtext})</span>}
        </div>
      ))}
    </div>
  );
}