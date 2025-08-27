import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSectionProps {
  children: React.ReactNode;
  isLoading: boolean;
  section: string;
  error?: Error | string | null;
  onRetry?: () => void;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface SectionErrorFallbackProps {
  section: string;
  error?: Error | string | null;
  onRetry?: () => void;
}

// Apple-inspired error fallback with gentle design
const SectionErrorFallback: React.FC<SectionErrorFallbackProps> = ({
  section,
  error,
  onRetry,
}) => (
  <Card className="group glass-effect border-red-500/20 bg-red-500/5 backdrop-blur-xl hover:border-red-500/30 transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Gentle error icon */}
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        
        {/* Clear, helpful messaging (Apple's clarity principle) */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white tracking-tight">
            {section} Unavailable
          </h3>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            {error ? 
              `${typeof error === 'string' ? error : error.message}` :
              `We couldn't load your ${section.toLowerCase()} right now. Please try again.`
            }
          </p>
        </div>

        {/* Retry button with Apple-inspired design */}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className={cn(
              "profile-nav-item touch-feedback",
              "bg-red-500/10 border-red-500/30 text-red-400",
              "hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300",
              "transition-all duration-200 rounded-xl px-4 py-2"
            )}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Apple-inspired loading skeleton with subtle animations
const CardSkeleton: React.FC<{ section?: string; priority?: 'high' | 'medium' | 'low' }> = ({ 
  section, 
  priority = 'medium' 
}) => (
  <Card className="glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl">
    <CardContent className="p-6">
      <div className="space-y-4">
        {/* Section header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-gray-700/50 rounded animate-pulse" />
            <div className="h-6 bg-gray-700/50 rounded-lg w-24 animate-pulse" />
          </div>
          {priority === 'high' && (
            <div className="w-16 h-8 bg-gray-700/30 rounded-lg animate-pulse" />
          )}
        </div>
        
        {/* Content skeleton with staggered animations */}
        <div className="space-y-3">
          <div 
            className="h-4 bg-gray-700/40 rounded-lg w-full animate-pulse"
            style={{ animationDelay: '0.1s' }}
          />
          <div 
            className="h-4 bg-gray-700/40 rounded-lg w-3/4 animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <div 
            className="h-4 bg-gray-700/40 rounded-lg w-5/6 animate-pulse"
            style={{ animationDelay: '0.3s' }}
          />
        </div>

        {/* Subtle loading indicator */}
        <div className="flex items-center justify-center pt-2">
          <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
          {section && (
            <span className="text-xs text-gray-500 ml-2 font-medium">
              Loading {section.toLowerCase()}...
            </span>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main ProfileSection component with Apple design principles
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  children,
  isLoading,
  section,
  error,
  onRetry,
  className,
  priority = 'medium',
}) => {
  const [hasLocalError, setHasLocalError] = useState<Error | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset error state when loading state changes
    if (isLoading) {
      setHasLocalError(null);
    }
  }, [isLoading]);

  // Gentle entrance animation (Apple's delight principle)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const displayError = error || hasLocalError;

  // Loading state with priority-based delay for better perceived performance
  if (isLoading) {
    return (
      <div 
        className={cn(
          "transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          className
        )}
      >
        <CardSkeleton section={section} priority={priority} />
      </div>
    );
  }

  // Error state
  if (displayError) {
    return (
      <div 
        className={cn(
          "transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          className
        )}
      >
        <SectionErrorFallback section={section} error={displayError} onRetry={onRetry} />
      </div>
    );
  }

  // Content wrapper with error boundary
  try {
    return (
      <div 
        className={cn(
          "transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          className
        )}
      >
        {children}
      </div>
    );
  } catch (catchError) {
    const errorObj = catchError instanceof Error ? catchError : new Error(String(catchError));
    setHasLocalError(errorObj);
    console.error(`Error in ${section} section:`, errorObj);
    return (
      <div 
        className={cn(
          "transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          className
        )}
      >
        <SectionErrorFallback section={section} error={errorObj} onRetry={onRetry} />
      </div>
    );
  }
};