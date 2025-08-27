"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuthActions } from '@/hooks/useAuthOptimized';
import { useAuthStore } from '@/stores/useAuthStore';
import { getSmartRedirect } from '@/lib/auth-optimization';

// Submission phases - clear progression
type SubmissionPhase = 'idle' | 'validating' | 'authenticating' | 'redirecting';

// Auth submission result - predictable response
interface AuthSubmissionResult {
  success: boolean;
  error?: string;
  phase: SubmissionPhase;
}

// Form data for submission
interface AuthFormData {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}

export function useAuthSubmission(
  mode: 'signin' | 'signup',
  onSuccess?: () => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<SubmissionPhase>('idle');
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle } = useAuthActions();
  const checkUser = useAuthStore((state) => state.checkUser);

  // Clear auth errors when user starts fixing
  const clearAuthError = useCallback(() => {
    if (authError) setAuthError(null);
  }, [authError]);

  // Enhanced error handling - user-friendly messages
  const handleAuthError = useCallback((error: any): string => {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('invalid credentials') || message.includes('invalid login credentials')) {
      setAuthError('Invalid email or password');
      return mode === 'signin' 
        ? 'The email or password you entered is incorrect. Please check your credentials and try again.'
        : 'Please check your email and password and try again.';
    }
    
    if (message.includes('email not found') || message.includes('user not found')) {
      setAuthError('Email not found');
      return 'No account found with this email address. Please check your email or sign up for a new account.';
    }
    
    if (message.includes('email') && message.includes('already') && message.includes('registered')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    
    if (message.includes('too many requests') || message.includes('rate limit')) {
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    }
    
    // Default friendly message
    return mode === 'signin' 
      ? "We couldn't sign you in right now. Please try again in a few moments."
      : "We couldn't create your account right now. Please try again in a few moments.";
  }, [mode]);

  // Submit form - inevitable implementation
  const submitForm = useCallback(async (formData: AuthFormData): Promise<AuthSubmissionResult> => {
    setIsLoading(true);
    setAuthError(null);
    setPhase('validating');

    // Brief UX delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      setPhase('authenticating');

      if (mode === 'signin') {
        const response = await signIn(formData.email, formData.password);
        
        if (response.error) {
          throw response.error;
        }

        if (response.data?.user) {
          setPhase('redirecting');
          setSuccessMessage('Welcome back!');
          
          // Refresh auth state
          await checkUser();
          await new Promise(resolve => setTimeout(resolve, 800));
          
          toast({
            title: 'Welcome back! 👋',
            description: 'Taking you to your dashboard...',
          });

          if (onSuccess) {
            onSuccess();
          } else {
            const redirectTo = getSmartRedirect(response.data.user);
            router.push(redirectTo);
          }

          return { success: true, phase: 'redirecting' };
        }
      } else {
        const response = await signUp(
          formData.email, 
          formData.password, 
          formData.username!, 
          formData.displayName
        );
        
        if (response.error) {
          throw response.error;
        }

        if (response.data?.user) {
          setPhase('redirecting');
          setSuccessMessage('Account created successfully!');
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          toast({
            title: 'Welcome to GameVault! 🎉',
            description: 'Setting up your gaming experience...',
          });

          if (onSuccess) {
            onSuccess();
          } else {
            const redirectTo = getSmartRedirect(response.data.user);
            router.push(redirectTo);
          }

          return { success: true, phase: 'redirecting' };
        }
      }

      throw new Error('Unexpected authentication state');
    } catch (error) {
      const errorMessage = handleAuthError(error);
      
      toast({
        title: mode === 'signin' ? 'Login failed' : 'Account creation failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return { success: false, error: errorMessage, phase: 'idle' };
    } finally {
      if (phase !== 'redirecting') {
        setIsLoading(false);
        setPhase('idle');
      }
    }
  }, [mode, signIn, signUp, checkUser, handleAuthError, toast, onSuccess, router, phase]);

  // Google authentication - simplified flow
  const submitGoogleAuth = useCallback(async (): Promise<AuthSubmissionResult> => {
    setIsLoading(true);
    setPhase('authenticating');
    setSuccessMessage('Connecting to Google...');

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await signInWithGoogle();
      
      if (result.error) {
        throw result.error;
      }

      if (result.data?.url) {
        setPhase('redirecting');
        setSuccessMessage('Redirecting to Google...');
        return { success: true, phase: 'redirecting' };
      }

      throw new Error('No redirect URL received');
    } catch (error) {
      const errorMessage = 'Unable to connect to Google. Please try again.';
      
      toast({
        title: 'Google Sign-in Failed',
        description: error instanceof Error ? error.message : errorMessage,
        variant: 'destructive',
      });

      setIsLoading(false);
      setPhase('idle');
      setSuccessMessage('');

      return { success: false, error: errorMessage, phase: 'idle' };
    }
  }, [signInWithGoogle, toast]);

  return {
    isLoading,
    phase,
    authError,
    successMessage,
    submitForm,
    submitGoogleAuth,
    clearAuthError,
  };
}