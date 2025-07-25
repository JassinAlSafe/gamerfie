"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          <h2 className="text-xl font-semibold text-red-500 mb-4">
            Something went wrong
          </h2>
          <pre className="bg-gray-900 p-4 rounded-lg mb-6 overflow-auto max-w-full">
            <code className="text-sm text-gray-300">
              {this.state.error?.stack}
            </code>
          </pre>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            variant="outline"
            className="text-gray-400 hover:text-white"
          >
            Try again
          </Button>
          <p className="mt-4 text-sm text-gray-400">
            If this persists, please contact support.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
