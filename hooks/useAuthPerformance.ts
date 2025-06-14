/**
 * Authentication Performance Monitoring Hook
 * Tracks auth performance metrics and provides optimization insights
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

interface AuthMetrics {
  signInTime: number;
  profileFetchTime: number;
  totalAuthTime: number;
  cacheHitRate: number;
  errors: number;
}

export function useAuthPerformance() {
  const [metrics, setMetrics] = useState<AuthMetrics>({
    signInTime: 0,
    profileFetchTime: 0,
    totalAuthTime: 0,
    cacheHitRate: 0,
    errors: 0
  });
  
  const [authStartTime, setAuthStartTime] = useState<number | null>(null);
  const { isLoading, user, error } = useAuthStore();

  // Track auth start
  const trackAuthStart = useCallback(() => {
    setAuthStartTime(Date.now());
  }, []);

  // Track auth completion
  useEffect(() => {
    if (authStartTime && !isLoading && (user || error)) {
      const totalTime = Date.now() - authStartTime;
      
      setMetrics(prev => ({
        ...prev,
        totalAuthTime: totalTime,
        errors: error ? prev.errors + 1 : prev.errors
      }));
      
      setAuthStartTime(null);
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth Performance:', {
          totalTime: `${totalTime}ms`,
          success: !!user,
          error: !!error
        });
      }
    }
  }, [authStartTime, isLoading, user, error]);

  // Pre-warm auth on component mount
  useEffect(() => {
    const { preWarmAuth } = useAuthStore.getState();
    preWarmAuth();
  }, []);

  return {
    metrics,
    trackAuthStart,
    isOptimal: metrics.totalAuthTime < 2000, // Under 2 seconds is good
    suggestions: metrics.totalAuthTime > 3000 ? 
      ['Consider enabling caching', 'Check network connection', 'Verify Supabase configuration'] : 
      []
  };
}