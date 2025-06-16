import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  cacheHitRate: number;
  apiCallCount: number;
  lastUpdated: Date;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    cacheHitRate: 0,
    apiCallCount: 0,
    lastUpdated: new Date()
  });
  const startTime = useRef<number>(0);
  const apiCallsRef = useRef<number>(0);
  const cacheHitsRef = useRef<number>(0);
  const totalRequestsRef = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
  }, []);

  const recordApiCall = () => {
    apiCallsRef.current += 1;
    totalRequestsRef.current += 1;
  };

  const recordCacheHit = () => {
    cacheHitsRef.current += 1;
    totalRequestsRef.current += 1;
  };

  const finishLoading = () => {
    const loadTime = performance.now() - startTime.current;
    const cacheHitRate = totalRequestsRef.current > 0 
      ? (cacheHitsRef.current / totalRequestsRef.current) * 100 
      : 0;

    setMetrics({
      loadTime,
      cacheHitRate,
      apiCallCount: apiCallsRef.current,
      lastUpdated: new Date()
    });

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Performance Metrics:`, {
        loadTime: `${loadTime.toFixed(2)}ms`,
        cacheHitRate: `${cacheHitRate.toFixed(1)}%`,
        apiCallCount: apiCallsRef.current,
        totalRequests: totalRequestsRef.current
      });
    }
  };

  const reset = () => {
    startTime.current = performance.now();
    apiCallsRef.current = 0;
    cacheHitsRef.current = 0;
    totalRequestsRef.current = 0;
  };

  return {
    metrics,
    recordApiCall,
    recordCacheHit,
    finishLoading,
    reset
  };
}; 