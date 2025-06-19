import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ProfileSectionProps {
  children: React.ReactNode;
  isLoading: boolean;
  section: string;
  error?: Error | string | null;
  onRetry?: () => void;
}

interface SectionErrorFallbackProps {
  section: string;
  
  error?: Error | string | null;
  onRetry?: () => void;
}

// Error fallback component for section errors
const SectionErrorFallback: React.FC<SectionErrorFallbackProps> = ({
  section,
  error,
  onRetry,
}) => (
  <Card className="bg-gray-900/50 border-red-800/30 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-xl text-white flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        {section} Error
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-gray-300">
        {error ? 
          `Error: ${typeof error === 'string' ? error : error.message}` :
          "There was an error loading this section."
        }
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </CardContent>
  </Card>
);

// Fallback component for content loading with better UX
const CardSkeleton: React.FC<{ section?: string }> = ({ section }) => (
  <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
    <CardHeader className="animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 bg-gray-800 rounded"></div>
        <div className="h-6 bg-gray-800 rounded w-24"></div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
      </div>
      {section && (
        <p className="text-xs text-gray-500 mt-3">Loading {section.toLowerCase()}...</p>
      )}
    </CardContent>
  </Card>
);

// Wrapper component with error handling
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  children,
  isLoading,
  section,
  error,
  onRetry,
}) => {
  const [hasLocalError, setHasLocalError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset error state when loading state changes
    if (isLoading) {
      setHasLocalError(null);
    }
  }, [isLoading]);

  const displayError = error || hasLocalError;

  if (isLoading) {
    return <CardSkeleton section={section} />;
  }

  if (displayError) {
    return <SectionErrorFallback section={section} error={displayError} onRetry={onRetry} />;
  }

  try {
    return <>{children}</>;
  } catch (catchError) {
    const errorObj = catchError instanceof Error ? catchError : new Error(String(catchError));
    setHasLocalError(errorObj);
    console.error(`Error in ${section} section:`, errorObj);
    return <SectionErrorFallback section={section} error={errorObj} onRetry={onRetry} />;
  }
};