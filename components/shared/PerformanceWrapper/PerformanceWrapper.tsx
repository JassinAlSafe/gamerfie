"use client";

import React, { 
  memo, 
  Suspense, 
  lazy, 
  useMemo, 
  useCallback,
  ComponentType
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useInView } from "react-intersection-observer";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface PerformanceWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: ComponentType<ErrorFallbackProps>;
  lazy?: boolean;
  intersection?: boolean;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

const DefaultErrorFallback = memo(({ 
  error, 
  resetErrorBoundary 
}: ErrorFallbackProps) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-400 mb-2">⚠️</div>
    <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
    <p className="text-white/60 text-sm mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
    >
      Try again
    </button>
  </div>
));

DefaultErrorFallback.displayName = "DefaultErrorFallback";

const DefaultFallback = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
  </div>
));

DefaultFallback.displayName = "DefaultFallback";

/**
 * High-performance wrapper component that provides:
 * - Error boundaries
 * - Lazy loading
 * - Intersection observer optimization
 * - Suspense boundaries
 * - Memoization
 */
export const PerformanceWrapper = memo(({
  children,
  fallback,
  errorFallback,
  lazy = false,
  intersection = false,
  threshold = 0.1,
  rootMargin = "50px",
  className,
}: PerformanceWrapperProps) => {
  
  const ErrorFallbackComponent = errorFallback || DefaultErrorFallback;

  // Intersection observer for lazy loading
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold,
    rootMargin,
    skip: !intersection,
  });

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error("PerformanceWrapper caught an error:", error, errorInfo);
  }, []);

  const content = useMemo(() => {
    // Don't render until in view if intersection observer is enabled
    if (intersection && !inView) {
      return <div ref={ref} className="min-h-[200px]" />;
    }

    return children;
  }, [children, intersection, inView, ref]);

  const wrappedContent = useMemo(() => {
    const LoadingFallback = fallback || <DefaultFallback />;
    
    if (lazy) {
      return (
        <Suspense fallback={LoadingFallback}>
          {content}
        </Suspense>
      );
    }
    return content;
  }, [content, lazy, fallback]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallbackComponent}
      onError={handleError}
    >
      <div className={className} ref={intersection ? ref : undefined}>
        {wrappedContent}
      </div>
    </ErrorBoundary>
  );
});

PerformanceWrapper.displayName = "PerformanceWrapper";

/**
 * HOC for wrapping components with performance optimizations
 */
export function withPerformance(
  Component: ComponentType<any>,
  options: Omit<PerformanceWrapperProps, 'children'> = {}
) {
  const WrappedComponent = (props: any) => (
    <PerformanceWrapper {...options}>
      <Component {...props} />
    </PerformanceWrapper>
  );

  WrappedComponent.displayName = `withPerformance(${Component.displayName || Component.name})`;
  
  return memo(WrappedComponent);
}

/**
 * Hook for creating lazy-loaded components
 */
export function useLazyComponent(
  factory: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) {
  return useMemo(() => {
    const LazyComponent = lazy(factory);
    
    const MemoizedLazyComponent = (props: any) => (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );

    MemoizedLazyComponent.displayName = "LazyComponent";
    
    return memo(MemoizedLazyComponent);
  }, [factory, fallback]);
}