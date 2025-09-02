"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

interface ProfileModalErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export class ProfileModalErrorBoundary extends React.Component<
  ProfileModalErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ProfileModalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `profile-modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring (can integrate with error tracking service)
    console.error('ProfileModal Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: '',
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="error-title"
        >
          <div className="relative w-full max-w-[400px] mx-auto bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-red-500/30 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              
              <h2 id="error-title" className="text-xl font-bold text-white mb-2">
                Profile Unavailable
              </h2>
              
              <p className="text-gray-400 text-sm mb-4 max-w-sm mx-auto">
                We encountered an issue loading this profile. This might be temporary.
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-purple-600 hover:bg-purple-700 text-white border-0 h-9"
                  aria-label="Retry loading profile"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800/50 h-9"
                >
                  Refresh Page
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="mt-2 text-xs text-red-400 bg-gray-800/50 p-2 rounded border overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Reset error when component unmounts
  React.useEffect(() => {
    return () => setError(null);
  }, []);

  return { error, resetError, handleError };
}