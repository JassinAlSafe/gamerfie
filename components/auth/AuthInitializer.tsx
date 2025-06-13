"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthInitializer() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return null;
}