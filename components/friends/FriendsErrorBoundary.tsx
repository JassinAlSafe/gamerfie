"use client";

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shell } from '@/app/layout/shell';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FriendsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Friends page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Shell maxWidth="6xl" padding="lg">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Card className="p-8 max-w-md w-full text-center bg-card/50 border-border/30 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-red-500/20">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Something went wrong
                  </h3>
                  <p className="text-muted-foreground">
                    The friends page encountered an error. Please try refreshing the page.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="border-border/30"
                  >
                    Go Back
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="text-sm text-muted-foreground cursor-pointer">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 text-xs bg-muted/20 p-2 rounded text-red-400 overflow-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </Card>
          </div>
        </Shell>
      );
    }

    return this.props.children;
  }
}