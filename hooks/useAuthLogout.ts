"use client";

import { useQueryClient } from '@tanstack/react-query';
import { useAuthStoreOptimized } from '@/stores/useAuthStoreOptimized';

/**
 * Hook to handle logout with automatic QueryClient clearing
 * This ensures all React Query cache is cleared during logout
 */
export function useAuthLogout() {
  const queryClient = useQueryClient();
  const signOut = useAuthStoreOptimized((state) => state.signOut);
  
  const logout = async (scope?: 'global' | 'local' | 'others') => {
    await signOut(scope, queryClient);
  };
  
  return { logout };
}