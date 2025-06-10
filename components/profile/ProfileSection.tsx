import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ProfileSectionProps {
  children: React.ReactNode;
  isLoading: boolean;
  section: string;
}

interface SectionErrorFallbackProps {
  section: string;
}

// Error fallback component for section errors
const SectionErrorFallback: React.FC<SectionErrorFallbackProps> = ({
  section,
}) => (
  <Card className="bg-gray-900/50 border-red-800/30 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-xl text-white flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        {section} Error
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-300">
        There was an error loading this section. Please try refreshing the page.
      </p>
    </CardContent>
  </Card>
);

// Fallback component for content loading
const CardSkeleton: React.FC = () => (
  <div className="rounded-lg bg-gray-900/50 border border-gray-800 animate-pulse">
    <div className="h-12 border-b border-gray-800"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
    </div>
  </div>
);

// Wrapper component with error handling
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  children,
  isLoading,
  section,
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // Reset error state when loading state changes
    if (isLoading) {
      setHasError(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return <CardSkeleton />;
  }

  if (hasError) {
    return <SectionErrorFallback section={section} />;
  }

  try {
    return <>{children}</>;
  } catch (error) {
    setHasError(true);
    console.error(`Error in ${section} section:`, error);
    return <SectionErrorFallback section={section} />;
  }
};