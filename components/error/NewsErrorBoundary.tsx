"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<NewsErrorFallbackProps>;
}

interface NewsErrorFallbackProps {
  error?: Error;
  reset?: () => void;
}

function DefaultNewsErrorFallback({ error, reset }: NewsErrorFallbackProps) {
  return (
    <div className="text-center py-12">
      <div className="p-4 bg-red-500/10 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-4">
        Unable to Load News
      </h3>
      
      <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
        {error?.message?.includes("does not exist") 
          ? "The news system is currently being set up. Please check back later or contact support if this issue persists."
          : "We're having trouble loading the latest news. This might be a temporary connection issue."}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {reset && (
          <Button 
            onClick={reset} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        
        <Button variant="outline" asChild>
          <a href="/">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </a>
        </Button>
        
        <Button variant="outline" asChild>
          <a href="/info/contact">
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </Button>
      </div>

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-8 p-4 bg-gray-800/50 rounded-lg text-left max-w-2xl mx-auto">
          <summary className="text-sm font-medium text-yellow-400 cursor-pointer mb-2">
            Development Error Details
          </summary>
          <pre className="text-xs text-gray-400 overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

class NewsErrorBoundaryClass extends React.Component<
  NewsErrorBoundaryProps & { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: NewsErrorBoundaryProps & { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('News Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultNewsErrorFallback;
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

export function NewsErrorBoundary({ children, fallback }: NewsErrorBoundaryProps) {
  return (
    <NewsErrorBoundaryClass fallback={fallback}>
      {children}
    </NewsErrorBoundaryClass>
  );
}