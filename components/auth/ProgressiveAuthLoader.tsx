/**
 * Progressive Auth Loader
 * Shows progressive loading states with helpful messages
 */

"use client";

import { useState, useEffect } from 'react';
import { Loader2, User, Shield, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

interface LoadingStage {
  icon: React.ReactNode;
  message: string;
  duration: number;
}

const loadingStages: LoadingStage[] = [
  {
    icon: <Loader2 className="w-5 h-5 animate-spin" />,
    message: "Preparing authentication...",
    duration: 800
  },
  {
    icon: <Shield className="w-5 h-5" />,
    message: "Securing your connection...",
    duration: 1200
  },
  {
    icon: <User className="w-5 h-5" />,
    message: "Setting up your profile...",
    duration: 1000
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    message: "Almost ready!",
    duration: 600
  }
];

interface ProgressiveAuthLoaderProps {
  show: boolean;
  className?: string;
}

export function ProgressiveAuthLoader({ show, className = "" }: ProgressiveAuthLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const { isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!show || !isLoading) {
      setCurrentStage(0);
      return;
    }

    const timer = setTimeout(() => {
      if (currentStage < loadingStages.length - 1) {
        setCurrentStage(prev => prev + 1);
      }
    }, loadingStages[currentStage]?.duration || 1000);

    return () => clearTimeout(timer);
  }, [show, isLoading, currentStage]);

  // Skip to success stage when user is loaded
  useEffect(() => {
    if (user && show) {
      setCurrentStage(loadingStages.length - 1);
    }
  }, [user, show]);

  if (!show) return null;

  const stage = loadingStages[currentStage];

  return (
    <div className={`flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg border border-white/10 ${className}`}>
      <div className="flex-shrink-0 text-purple-400">
        {stage?.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-300">
          {stage?.message}
        </p>
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-purple-400 h-1 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${((currentStage + 1) / loadingStages.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}