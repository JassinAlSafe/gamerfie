"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

class AuthErrorBoundaryClass extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ 
  error, 
  reset 
}: { 
  error?: Error; 
  reset: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Authentication Error</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message || "Something went wrong with authentication"}
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        Try Again
      </Button>
    </div>
  );
}

export function AuthErrorBoundary({ children, fallback }: AuthErrorBoundaryProps) {
  return (
    <AuthErrorBoundaryClass fallback={fallback}>
      {children}
    </AuthErrorBoundaryClass>
  );
}