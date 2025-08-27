"use client";

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FloatingInput } from '@/components/ui/floating-input';
import { Loader2, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Custom hooks - inevitable abstractions
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuthSubmission } from '@/hooks/useAuthSubmission';
import { useAuthUrlParams } from '@/hooks/useAuthUrlParams';
import { useAuthKeyboard } from '@/hooks/useAuthKeyboard';

// Field components - self-contained
import { EmailField } from './fields/EmailField';
import { UsernameField } from './fields/UsernameField';
import { PasswordField } from './fields/PasswordField';

// UI components
import { ProgressiveAuthLoader } from './ProgressiveAuthLoader';

// Google Icon - inevitable implementation
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
    />
  </svg>
);

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  // Form state management - inevitable hook
  const {
    formData,
    errors,
    touched,
    updateField,
    touchField,
    validateAll,
    clearErrors,
  } = useAuthForm(mode);

  // Submission handling - inevitable flow
  const {
    isLoading,
    phase,
    authError,
    successMessage,
    submitForm,
    submitGoogleAuth,
    clearAuthError,
  } = useAuthSubmission(mode, onSuccess);

  // URL parameter handling - inevitable error recovery
  useAuthUrlParams();

  // Form submission - inevitable implementation
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const { isValid } = validateAll();
    if (!isValid) return;

    clearAuthError();
    await submitForm(formData);
  };

  // Google authentication - inevitable implementation  
  const handleGoogleAuth = async () => {
    clearAuthError();
    await submitGoogleAuth();
  };

  // Keyboard shortcuts - inevitable UX
  useAuthKeyboard({
    onGoogleAuth: handleGoogleAuth,
    onSubmit: () => {
      const form = document.querySelector('form');
      form?.requestSubmit();
    },
    isLoading,
  });

  // Handle input changes - inevitable pattern
  const handleInputChange = (field: keyof typeof formData) => (value: string | boolean) => {
    if (authError) clearAuthError();
    updateField(field, value);
  };

  const handleInputBlur = (field: keyof typeof formData) => () => {
    touchField(field);
  };

  return (
    <div className="grid gap-6">
      {/* Progressive loading */}
      <ProgressiveAuthLoader show={isLoading} />
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center animate-in fade-in-50 duration-300">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            {successMessage}
          </p>
        </div>
      )}

      {/* Authentication error */}
      {authError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center animate-in fade-in-50 duration-300">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {authError}
          </p>
        </div>
      )}

      {/* Google Authentication */}
      <div className="grid gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={handleGoogleAuth}
          className="auth-button w-full h-12 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading && phase === 'authenticating' ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-purple-600" />
              <span>{successMessage || 'Connecting to Google...'}</span>
            </>
          ) : isLoading && phase === 'redirecting' ? (
            <>
              <div className="mr-3 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <GoogleIcon className="mr-3 h-5 w-5" />
              <span>Continue with Google</span>
            </>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          One click authentication with your Google account
        </p>
        <p className="text-xs text-center text-muted-foreground/60 mt-1">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘/Ctrl+G</kbd> for quick Google sign-in
        </p>
      </div>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="grid gap-4 auth-form-slide-in">
        {/* Email Field */}
        <EmailField
          value={formData.email}
          onChange={handleInputChange('email')}
          onBlur={handleInputBlur('email')}
          error={errors.email}
          touched={touched.email}
          disabled={isLoading}
          mode={mode}
          authError={authError}
        />

        {/* Username Field - Signup Only */}
        {mode === 'signup' && (
          <UsernameField
            value={formData.username}
            onChange={handleInputChange('username')}
            onBlur={handleInputBlur('username')}
            error={errors.username}
            touched={touched.username}
            disabled={isLoading}
          />
        )}

        {/* Display Name Field - Signup Only */}
        {mode === 'signup' && (
          <div className="grid gap-2">
            <div className="relative">
              <FloatingInput
                id="displayName"
                name="displayName"
                label="Display Name"
                type="text"
                autoCapitalize="words"
                autoComplete="name"
                disabled={isLoading}
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName')(e.target.value)}
                onBlur={handleInputBlur('displayName')}
                error={errors.displayName}
                touched={touched.displayName}
                className="input-custom"
                required
              />
              {!errors.displayName && touched.displayName && formData.displayName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-in zoom-in-50 duration-200">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
            {errors.displayName && touched.displayName && (
              <p className="text-xs text-destructive">{errors.displayName}</p>
            )}
          </div>
        )}

        {/* Password Field */}
        <div className="grid gap-2">
          {mode === 'signin' && (
            <div className="flex items-center justify-end mb-1">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>
          )}
          
          <PasswordField
            value={formData.password}
            onChange={handleInputChange('password')}
            onBlur={handleInputBlur('password')}
            error={errors.password}
            touched={touched.password}
            disabled={isLoading}
            mode={mode}
            authError={authError}
          />
        </div>

        {/* Remember Me - Signin Only */}
        {mode === 'signin' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={handleInputChange('rememberMe')}
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Remember me
            </Label>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          className={cn(
            'auth-button w-full mt-2 h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
            'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
            'text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
            'border-0 hover:border-0 focus:ring-2 focus:ring-purple-500/50',
            phase === 'redirecting' && 'success-pulse'
          )} 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              {phase === 'validating' && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Validating...</span>
                </>
              )}
              {phase === 'authenticating' && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              )}
              {phase === 'redirecting' && (
                <>
                  <div className="mr-2 h-4 w-4 bg-green-400 rounded-full flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span>{successMessage || 'Success! Redirecting...'}</span>
                </>
              )}
            </>
          ) : (
            <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground/60 mt-2">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘/Ctrl+Enter</kbd> to submit quickly
        </p>
      </form>
    </div>
  );
}