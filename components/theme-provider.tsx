'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, computedTheme, initTheme } = useUIStore();

  useEffect(() => {
    const cleanup = initTheme();
    return cleanup;
  }, [initTheme]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(computedTheme);
  }, [computedTheme]);

  return <>{children}</>;
} 