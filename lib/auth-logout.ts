"use client";

import { createClient } from '@/utils/supabase/client';
import { QueryClient } from '@tanstack/react-query';

/**
 * Clear service worker caches
 */
async function clearServiceWorkerCache(): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = function(event) {
        if (event.data.success) {
          console.log('Service Worker: Cache cleared successfully');
          resolve();
        } else {
          console.error('Service Worker: Cache clearing failed:', event.data.error);
          reject(new Error(event.data.error));
        }
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_AUTH_CACHE' },
        [messageChannel.port2]
      );
    });
  } else {
    console.log('Service Worker: Not available or no controller');
    return Promise.resolve();
  }
}

/**
 * Comprehensive logout function following Supabase latest practices
 * 
 * Handles both client-side and server-side session clearing properly
 * Now includes React Query and Service Worker cache clearing
 */
export async function performLogout(scope: 'global' | 'local' | 'others' = 'local', queryClient?: QueryClient) {
  const supabase = createClient();

  try {
    // 1. Client-side logout using Supabase's built-in method
    // This automatically:
    // - Removes user from browser session
    // - Clears localStorage
    // - Revokes refresh token
    // - Triggers "SIGNED_OUT" event
    const { error: clientLogoutError } = await supabase.auth.signOut({ scope });
    
    if (clientLogoutError) {
      console.error('Client-side logout error:', clientLogoutError);
      throw clientLogoutError;
    }

    // 2. Clear React Query cache if available
    if (queryClient) {
      console.log('Clearing React Query cache...');
      queryClient.clear();
      // Remove all cached data
      queryClient.getQueryCache().clear();
      queryClient.getMutationCache().clear();
      console.log('React Query cache cleared');
    }

    // 3. Clear Service Worker caches
    try {
      await clearServiceWorkerCache();
    } catch (swError) {
      console.warn('Service Worker cache clearing failed:', swError);
      // Don't throw - continue with other cleanup
    }

    // 4. Clear ALL client-side storage and cookies
    if (typeof window !== 'undefined') {
      // Set logout flag before clearing everything
      localStorage.setItem('logged-out', 'true');
      
      // Clear ALL localStorage items (except the logout flag temporarily)
      const logoutFlag = localStorage.getItem('logged-out');
      localStorage.clear();
      if (logoutFlag) {
        localStorage.setItem('logged-out', 'true');
      }
      
      // Clear ALL sessionStorage items
      sessionStorage.clear();
      
      // Clear ALL cookies (including is-authenticated and any others)
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
        // Clear cookie for all possible paths and domains
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      });
      
      console.log('Cleared all client-side storage and cookies');
    }

    // 5. For Next.js with SSR, we need to clear server-side cookies
    // Create a simple server request that doesn't require CSRF
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // Include cookies
      });

      if (!response.ok) {
        console.warn('Server-side cookie cleanup failed:', response.status);
        // Don't throw here - client logout succeeded
      }
    } catch (serverError) {
      console.warn('Server-side logout request failed:', serverError);
      // Don't throw here - client logout succeeded
    }

    console.log('Logout completed successfully');
    return { success: true };

  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

/**
 * Force logout utility for when auth state is inconsistent
 * Clears all possible auth state without relying on Supabase calls
 */
export function forceLogout() {
  if (typeof window !== 'undefined') {
    // Clear all possible auth storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies by setting them to expire
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Force page reload to clear any cached state
    window.location.reload();
  }
}