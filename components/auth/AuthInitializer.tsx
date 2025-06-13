"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return null;
}