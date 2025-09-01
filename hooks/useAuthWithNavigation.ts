"use client";

import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/stores/useAuthStoreOptimized';
import { QueryClient } from '@tanstack/react-query';

/**
 * Custom hook that combines auth actions with Next.js 14 navigation
 * This follows Next.js 14 best practices for programmatic navigation
 */
export function useAuthWithNavigation() {
  const router = useRouter();
  const authActions = useAuthActions();

  const signOutWithNavigation = async (
    scope?: 'global' | 'local' | 'others', 
    queryClient?: QueryClient
  ) => {
    // Use Next.js 14 useRouter for navigation instead of window.location
    const navigateToHome = () => {
      console.log('🔄 Navigating to home using Next.js router...');
      router.push('/');
      // Optional: Add a small delay to ensure navigation completes
      // before any potential page refreshes
      router.refresh();
    };

    // Call signOut with the navigation callback
    await authActions.signOut(scope, queryClient, navigateToHome);
  };

  return {
    ...authActions,
    signOut: signOutWithNavigation,
  };
}

/**
 * For backward compatibility - simple hook that just provides signOut with navigation
 */
export function useSignOut() {
  const { signOut } = useAuthWithNavigation();
  return signOut;
}