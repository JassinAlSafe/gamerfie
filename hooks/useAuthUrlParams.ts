"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// Auth URL parameters - inevitable error and success handling
interface AuthUrlParams {
  error?: string;
  auth?: string;
}

// Error message mapping - user-friendly descriptions
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  oauth_failed: {
    title: 'Google Sign-in Failed',
    description: 'Google sign-in failed. Please try again.',
  },
  auth_failed: {
    title: 'Authentication Failed',
    description: 'Authentication failed. Please check your credentials.',
  },
  no_session: {
    title: 'Session Error',
    description: 'Could not establish session. Please try again.',
  },
  callback_failed: {
    title: 'Callback Error',
    description: 'Authentication callback failed. Please try again.',
  },
  no_code: {
    title: 'Invalid Request',
    description: 'Invalid authentication request. Please try again.',
  },
};

export function useAuthUrlParams() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const authSuccess = urlParams.get('auth');

    // Handle authentication errors
    if (error) {
      const errorConfig = ERROR_MESSAGES[error] || {
        title: 'Authentication Error',
        description: 'Authentication failed. Please try again.',
      };

      toast({
        title: errorConfig.title,
        description: errorConfig.description,
        variant: 'destructive',
      });

      // Clean up URL
      router.replace(window.location.pathname);
    }

    // Handle authentication success
    if (authSuccess === 'success') {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });

      // Clean up URL
      router.replace(window.location.pathname);
    }
  }, [router, toast]);

  // This hook doesn't return anything - it handles side effects
  return null;
}