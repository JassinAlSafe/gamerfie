"use client";

import { useEffect, useRef } from 'react';
import { useAuthStatus, useAuthActions } from '@/stores/useAuthStoreOptimized';

export function AuthInitializer() {
  const { isInitialized } = useAuthStatus();
  const { initialize, checkUser } = useAuthActions();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Always initialize on mount, regardless of state
    // This ensures we always check Supabase for the current auth state
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('🔄 AuthInitializer: Starting auth initialization...');
      initialize();
    }
  }, []); // Only run once on mount

  // Listen for auth state changes and refresh user data
  useEffect(() => {
    // Check for auth state changes on window focus (user might have signed in elsewhere)
    const handleFocus = () => {
      if (document.visibilityState === 'visible' && isInitialized) {
        checkUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isInitialized, checkUser]);

  return null;
}