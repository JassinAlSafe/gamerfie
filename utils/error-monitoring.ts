/**
 * Error monitoring and reporting utilities
 * 
 * This module provides a centralized way to report errors to monitoring services
 * Currently supports console logging with hooks for Sentry, LogRocket, etc.
 */

export interface ErrorContext {
  userId?: string;
  gameId?: string;
  component?: string;
  action?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface ErrorReport {
  message: string;
  error?: Error;
  level: 'info' | 'warning' | 'error' | 'fatal';
  context?: ErrorContext;
}

/**
 * Initialize error monitoring service
 * Add your monitoring service initialization here (Sentry, LogRocket, etc.)
 */
export function initializeErrorMonitoring() {
  // TODO: Initialize your preferred monitoring service
  // Example for Sentry:
  // import * as Sentry from "@sentry/nextjs";
  // Sentry.init({
  //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  //   environment: process.env.NODE_ENV,
  // });
  
  console.info('Error monitoring initialized');
}

/**
 * Report an error to the monitoring service
 */
export function reportError({
  message,
  error,
  level = 'error',
  context = {}
}: ErrorReport) {
  // Add default context
  const enrichedContext: ErrorContext = {
    ...context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
  };

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    const logMethod = level === 'fatal' || level === 'error' ? console.error : 
                     level === 'warning' ? console.warn : console.info;
    
    logMethod(`[${level.toUpperCase()}] ${message}`, {
      error,
      context: enrichedContext
    });
  }

  // Production error reporting
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to your monitoring service
    // Example for Sentry:
    // Sentry.withScope((scope) => {
    //   scope.setLevel(level as any);
    //   scope.setContext("error_details", enrichedContext);
    //   if (error) {
    //     Sentry.captureException(error);
    //   } else {
    //     Sentry.captureMessage(message);
    //   }
    // });
    
    // For now, send to a simple endpoint for logging
    try {
      fetch('/api/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          error: error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : null,
          level,
          context: enrichedContext
        })
      }).catch(() => {
        // Fail silently if error reporting fails
      });
    } catch {
      // Fail silently if error reporting fails
    }
  }
}

/**
 * Report a React component error
 */
export function reportComponentError(
  error: Error,
  errorInfo: React.ErrorInfo,
  componentName?: string
) {
  reportError({
    message: `React component error in ${componentName || 'Unknown Component'}`,
    error,
    level: 'error',
    context: {
      component: componentName,
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    }
  });
}

/**
 * Report an API error
 */
export function reportApiError(
  endpoint: string,
  error: Error | string,
  context: Partial<ErrorContext> = {}
) {
  reportError({
    message: `API Error: ${endpoint}`,
    error: error instanceof Error ? error : new Error(error),
    level: 'error',
    context: {
      ...context,
      endpoint,
      apiError: true
    }
  });
}

/**
 * Report a user action for debugging
 */
export function reportUserAction(
  action: string,
  context: Partial<ErrorContext> = {}
) {
  reportError({
    message: `User Action: ${action}`,
    level: 'info',
    context: {
      ...context,
      action,
      userAction: true
    }
  });
}

/**
 * Report a performance issue
 */
export function reportPerformanceIssue(
  metric: string,
  value: number,
  threshold: number,
  context: Partial<ErrorContext> = {}
) {
  reportError({
    message: `Performance issue: ${metric} (${value}ms > ${threshold}ms)`,
    level: 'warning',
    context: {
      ...context,
      metric,
      value,
      threshold,
      performance: true
    }
  });
}