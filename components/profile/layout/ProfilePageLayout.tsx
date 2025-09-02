"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ProfilePageAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
}

interface ProfilePageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ProfilePageAction[];
  children: React.ReactNode;
  className?: string;
}

export function ProfilePageLayout({
  title,
  subtitle,
  actions = [],
  children,
  className = ""
}: ProfilePageLayoutProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Consistent Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {title}
            {subtitle && (
              <span className="text-lg font-normal text-gray-400 ml-2">
                {subtitle}
              </span>
            )}
          </h1>
        </div>
        
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || "outline"}
                className="border-gray-700/50 hover:bg-gray-800/50"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
        {children}
      </div>
    </div>
  );
}