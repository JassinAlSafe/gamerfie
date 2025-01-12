"use client";

import { memo } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export const ErrorDisplay = memo(({ message, onRetry }: ErrorDisplayProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <AlertCircle className="w-12 h-12 mb-4" />
    <p className="mb-4 text-center max-w-md">{message}</p>
    <Button
      variant="outline"
      onClick={onRetry}
      className="text-gray-400 hover:text-white"
    >
      Try Again
    </Button>
  </div>
));

ErrorDisplay.displayName = "ErrorDisplay";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
      <p className="text-red-400">Something went wrong:</p>
      <pre className="text-sm text-red-300">{error.message}</pre>
      <Button onClick={resetErrorBoundary} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
