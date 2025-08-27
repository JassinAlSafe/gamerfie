"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Wifi } from "lucide-react";

// Error categorization for better user messaging
type ErrorCategory = 'network' | 'permission' | 'data' | 'unknown';

function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network';
  }
  
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'permission';
  }
  
  if (message.includes('parse') || message.includes('invalid') || message.includes('malformed')) {
    return 'data';
  }
  
  return 'unknown';
}

function getErrorMessage(category: ErrorCategory): string {
  switch (category) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection.';
    case 'permission':
      return 'You don\'t have permission to access this data. Please try signing in again.';
    case 'data':
      return 'The game data appears to be corrupted. Please try refreshing.';
    default:
      return 'We encountered an unexpected error while loading your game library.';
  }
}

function getErrorIcon(category: ErrorCategory) {
  switch (category) {
    case 'network':
      return Wifi;
    case 'permission':
    case 'data':
    case 'unknown':
    default:
      return AlertTriangle;
  }
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  errorCategory?: ErrorCategory;
}

export class GameLibraryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorCategory = categorizeError(error);
    
    this.setState((prevState) => ({
      error,
      errorInfo,
      retryCount: prevState.retryCount + 1,
      errorCategory,
    }));

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('GameLibraryErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    // Prevent excessive retries
    if (this.state.retryCount >= 3) {
      console.warn('Maximum retry attempts reached. Forcing page reload.');
      window.location.reload();
      return;
    }

    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorCategory: undefined
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorCategory = this.state.errorCategory || 'unknown';
      const ErrorIcon = getErrorIcon(errorCategory);
      const errorMessage = getErrorMessage(errorCategory);

      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-2xl border border-red-500/20 backdrop-blur-sm">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/30 border border-red-500/30 flex items-center justify-center">
              <ErrorIcon className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-white">
            {errorCategory === 'network' ? 'Connection Problem' : 'Something went wrong'}
          </h2>
          
          <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
            {errorMessage}
            {this.state.retryCount > 0 && (
              <span className="block mt-2 text-sm text-red-300">
                Retry attempts: {this.state.retryCount}/3
              </span>
            )}
          </p>

          <div className="space-y-3">
            <Button
              onClick={this.handleRetry}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 text-left max-w-lg">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Technical Details (Development Mode)
                </summary>
                <div className="mt-2 text-xs text-red-400 font-mono">
                  <p className="mb-2">{this.state.error.message}</p>
                  <pre className="whitespace-pre-wrap text-xs text-gray-500">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-500">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components (requires react-error-boundary)
export function GameLibraryErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-2xl border border-red-500/20 backdrop-blur-sm">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/30 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3 text-white">
        Failed to load game library
      </h2>
      
      <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
        {error.message || "An unexpected error occurred while loading your games."}
      </p>

      <Button
        onClick={resetErrorBoundary}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 hover:scale-105"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}