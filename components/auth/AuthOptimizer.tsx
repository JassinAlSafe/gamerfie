/**
 * Auth Optimizer Component
 * Handles performance optimizations and smart user flows
 */

"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuthPerformance } from '@/hooks/useAuthPerformance';
import { getSmartRedirect } from '@/lib/auth-optimization';

interface AuthOptimizerProps {
  children: React.ReactNode;
}

export function AuthOptimizer({ children }: AuthOptimizerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isInitialized, isLoading } = useAuthStore();
  const { trackAuthStart } = useAuthPerformance();
  
  const intendedPath = searchParams.get('redirect') || undefined;

  // Handle authentication redirects
  useEffect(() => {
    if (isInitialized && !isLoading) {
      const currentPath = window.location.pathname;
      
      // Skip redirect logic for auth pages themselves
      if (['/signin', '/signup', '/auth/callback', '/auth/loading'].includes(currentPath)) {
        return;
      }
      
      if (user) {
        // User is authenticated
        const redirectTo = getSmartRedirect(user, intendedPath);
        
        if (redirectTo !== currentPath) {
          router.push(redirectTo);
        }
      } else {
        // User is not authenticated, check if they're on a protected route
        const protectedRoutes = ['/profile', '/dashboard', '/settings', '/games'];
        const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
        
        if (isProtectedRoute) {
          router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
        }
      }
    }
  }, [user, isInitialized, isLoading, router, intendedPath]);

  // Track auth performance
  useEffect(() => {
    if (isLoading) {
      trackAuthStart();
    }
  }, [isLoading, trackAuthStart]);

  return <>{children}</>;
}