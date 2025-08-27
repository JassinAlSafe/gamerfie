"use client";

import { useEffect, useState } from 'react';
import { FloatingInput } from '@/components/ui/floating-input';
import { Loader2, Check, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { detectExistingUser, type UserDetectionResult } from '@/lib/auth-optimization';

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  mode: 'signin' | 'signup';
  authError?: string | null;
}

export function EmailField({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  disabled, 
  mode,
  authError 
}: EmailFieldProps) {
  const [userDetection, setUserDetection] = useState<UserDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const debouncedEmail = useDebounce(value, 800);

  // Smart user detection - only when email is valid
  useEffect(() => {
    if (debouncedEmail && debouncedEmail.includes('@') && !error) {
      setIsDetecting(true);
      
      detectExistingUser(debouncedEmail)
        .then(setUserDetection)
        .catch(() => setUserDetection(null))
        .finally(() => setIsDetecting(false));
    } else {
      setUserDetection(null);
    }
  }, [debouncedEmail, error]);

  // Field status indicator - inevitable visual feedback
  const renderStatusIcon = () => {
    if (isDetecting) {
      return <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />;
    }

    if (!error && touched && value) {
      if (userDetection?.exists) {
        return <UserCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />;
      }
      return <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />;
    }

    return null;
  };

  // Smart user feedback - contextual and helpful
  const renderUserFeedback = () => {
    if (!userDetection || error) return null;

    if (userDetection.exists) {
      return (
        <div className="text-xs animate-in slide-in-from-top-2 duration-300">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {mode === 'signup'
                ? 'This email is already registered'
                : 'Welcome back! We found your account'}
            </p>
            {mode === 'signup' && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">Want to sign in instead?</span>
                <Link 
                  href="/signin" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium underline underline-offset-2"
                >
                  Sign in here
                </Link>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (mode === 'signup') {
      return (
        <div className="text-xs animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-green-700 dark:text-green-300 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Perfect! This email is available
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid gap-2">
      <div className="relative">
        <FloatingInput
          id="email"
          name="email"
          label="Email address"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          error={error || (authError ? 'Check your email' : '')}
          touched={touched}
          className={cn(
            'input-custom',
            authError && 'border-red-500 focus:border-red-500'
          )}
          required
        />
        {renderStatusIcon()}
      </div>
      
      {error && touched && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      
      {renderUserFeedback()}
    </div>
  );
}