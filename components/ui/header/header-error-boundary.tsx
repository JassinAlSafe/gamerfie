"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface HeaderErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

/**
 * Error boundary specifically designed for header components
 * Provides a fallback UI when header components fail to render
 */
export class HeaderErrorBoundary extends React.Component<
  HeaderErrorBoundaryProps,
  HeaderErrorBoundaryState
> {
  constructor(props: HeaderErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): HeaderErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Header Error Boundary caught an error:", error, errorInfo);
    
    // You can also log the error to an error reporting service here
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: `Header Error: ${error.message}`,
        fatal: false,
      });
    }

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error} reset={this.handleReset} />;
      }

      return <HeaderErrorFallback error={this.state.error} reset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Default fallback component for header errors
 * Provides a minimal header with error state
 */
function HeaderErrorFallback({ 
  reset 
}: { 
  error?: Error; 
  reset: () => void; 
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="font-bold text-white/90">Game Vault</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-red-400">
            Header loading error
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300"
            aria-label="Retry loading header"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </header>
  );
}

/**
 * Hook to provide error boundary functionality to functional components
 */
export function useHeaderErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error("Header Error Handler caught an error:", error);
    setError(error);
  }, []);

  return {
    error,
    resetError,
    captureError,
    hasError: !!error,
  };
}