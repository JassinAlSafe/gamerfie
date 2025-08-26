"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const checkUser = useAuthStore((state) => state.checkUser);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

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