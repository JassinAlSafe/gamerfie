"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { FloatingPasswordInput } from "@/components/ui/floating-password-input";
import { Loader2, Check, Shield, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { 
  type PasswordUpdateState,
  type PasswordUpdateFormData,
  type PasswordResetStep
} from "@/types/auth.types";

export function ResetPasswordForm() {
  const [step, setStep] = useState<PasswordResetStep>('reset_form');
  const [formData, setFormData] = useState<PasswordUpdateFormData>({
    password: "",
    confirmPassword: "",
  });
  const [state, setState] = useState<PasswordUpdateState>({
    password: "",
    confirmPassword: "",
    isLoading: false,
    success: false,
    error: null,
    strength: 0,
    isValid: false,
    passwordsMatch: false,
  });
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { updatePassword, checkUser, onAuthStateChange } = useAuthStore();

  // Check for URL parameters
  const hasRecoveryToken = searchParams.get('recovery') === 'true';
  const urlError = searchParams.get('error');
  const [isRecoveryMode, setIsRecoveryMode] = useState(hasRecoveryToken);

  // Password strength calculation
  const calculatePasswordStrength = useCallback((password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, []);

  // Validate password requirements
  const validatePassword = useCallback((password: string) => {
    return password.length >= 8 && calculatePasswordStrength(password) >= 3;
  }, [calculatePasswordStrength]);

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear errors when user starts typing
      if (state.error) {
        setState(prev => ({ ...prev, error: null }));
      }
      
      // Real-time validation for password
      if (name === 'password') {
        const strength = calculatePasswordStrength(value);
        const isValid = validatePassword(value);
        const passwordsMatch = value === formData.confirmPassword;
        
        setState(prev => ({ 
          ...prev, 
          password: value,
          strength, 
          isValid,
          passwordsMatch: passwordsMatch || !formData.confirmPassword
        }));
      }
      
      // Real-time validation for confirm password
      if (name === 'confirmPassword') {
        const passwordsMatch = value === formData.password;
        setState(prev => ({ 
          ...prev, 
          confirmPassword: value,
          passwordsMatch 
        }));
      }
    },
    [formData.password, formData.confirmPassword, state.error, calculatePasswordStrength, validatePassword]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name } = e.target;
      setTouched(prev => ({ ...prev, [name as keyof typeof touched]: true }));
    },
    []
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validatePassword(formData.password)) {
      setState(prev => ({ 
        ...prev, 
        error: "Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols" 
      }));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setState(prev => ({ 
        ...prev, 
        error: "Passwords do not match" 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await updatePassword(formData.password);
      
      setState(prev => ({ ...prev, success: true }));
      setStep('success');

      // Check user to refresh auth state
      await checkUser();

      toast({
        title: "Password updated! 🎉",
        description: "Your password has been successfully changed.",
      });

      // Redirect after success
      setTimeout(() => {
        router.push("/?auth=password_reset_success");
      }, 2000);
      
    } catch (error) {
      console.error("Password update error:", error);
      
      let errorMessage = "Unable to update password. Please try again.";
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes("weak password")) {
          errorMessage = "Password is too weak. Please choose a stronger password.";
        } else if (message.includes("same password")) {
          errorMessage = "New password must be different from your current password.";
        } else if (message.includes("session") || message.includes("auth")) {
          errorMessage = "Your password reset link has expired. Please request a new one.";
        } else if (message.includes("network") || message.includes("connection")) {
          errorMessage = "Connection problem. Please check your internet and try again.";
        }
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: "Error updating password",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    if (isRecoveryMode) {
      const authStateHandler = onAuthStateChange((event, session) => {
        console.log('Auth state change:', event, !!session);
        
        if (event === 'PASSWORD_RECOVERY' && session) {
          console.log('PASSWORD_RECOVERY event detected');
          setIsRecoveryMode(true);
        }
      });
      
      unsubscribe = authStateHandler.unsubscribe;
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isRecoveryMode, onAuthStateChange]);

  // Handle URL errors
  useEffect(() => {
    if (urlError) {
      let errorMessage = "Something went wrong. Please try again.";
      
      switch (urlError) {
        case 'invalid_token':
          errorMessage = "Your password reset link is invalid or has expired. Please request a new one.";
          break;
        case 'no_session':
          errorMessage = "Unable to verify your identity. Please request a new password reset link.";
          break;
        case 'callback_failed':
          errorMessage = "Password reset failed. Please try requesting a new link.";
          break;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      setStep('error');
      
      toast({
        title: "Password Reset Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [urlError, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Quick submit (Cmd/Ctrl + Enter)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !state.isLoading) {
        event.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isLoading]);

  // Success view
  if (step === 'success') {
    return (
      <div className="grid gap-6 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500">
          <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Password updated!</h2>
          <p className="text-muted-foreground">
            Your password has been successfully changed. You'll be redirected shortly.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-700 dark:text-green-300">
            For security, you've been automatically signed in with your new password.
          </p>
        </div>
      </div>
    );
  }

  // Error view
  if (step === 'error') {
    return (
      <div className="grid gap-6 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Reset link expired</h2>
          <p className="text-muted-foreground">
            {state.error || "Your password reset link has expired or is invalid."}
          </p>
        </div>

        <Button
          onClick={() => router.push("/forgot-password")}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
        >
          Request new reset link
        </Button>
      </div>
    );
  }

  // Check if user has valid recovery session
  if (!isRecoveryMode && !urlError) {
    return (
      <div className="grid gap-6 text-center">
        <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Access required</h2>
          <p className="text-muted-foreground">
            You need a valid password reset link to access this page.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push("/forgot-password")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            Get reset link
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/signin")}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Main form view
  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Set new password</h1>
        <p className="text-muted-foreground">
          Choose a strong password for your GameVault account.
        </p>
      </div>

      {/* Error banner */}
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center animate-in fade-in-50 duration-300">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {state.error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* New Password Field */}
        <div className="grid gap-2">
          <FloatingPasswordInput
            id="password"
            name="password"
            label="New password"
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect="off"
            disabled={state.isLoading}
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            error={
              touched.password && !state.isValid && formData.password
                ? "Password must be at least 8 characters with mixed characters"
                : ""
            }
            touched={touched.password}
            className={cn(
              "input-custom",
              touched.password && !state.isValid && "border-red-500 focus:border-red-500",
              touched.password && state.isValid && "border-green-500 focus:border-green-500"
            )}
            required
          />
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-full rounded-full transition-all duration-300",
                      i < state.strength
                        ? state.strength <= 2
                          ? "bg-red-500 shadow-sm"
                          : state.strength <= 3
                          ? "bg-yellow-500 shadow-sm"
                          : "bg-green-500 shadow-sm"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  state.strength <= 2 && "text-red-600 dark:text-red-400",
                  state.strength === 3 && "text-yellow-600 dark:text-yellow-400",
                  state.strength >= 4 && "text-green-600 dark:text-green-400"
                )}>
                  {state.strength <= 2 && "🔴 Weak password"}
                  {state.strength === 3 && "🟡 Good password"}
                  {state.strength >= 4 && "🟢 Strong password"}
                </p>
                {state.strength >= 4 && (
                  <div className="animate-in zoom-in-50 duration-200">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="grid gap-2">
          <FloatingPasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm new password"
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect="off"
            disabled={state.isLoading}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleBlur}
            error={
              touched.confirmPassword && !state.passwordsMatch && formData.confirmPassword
                ? "Passwords do not match"
                : ""
            }
            touched={touched.confirmPassword}
            className={cn(
              "input-custom",
              touched.confirmPassword && !state.passwordsMatch && "border-red-500 focus:border-red-500",
              touched.confirmPassword && state.passwordsMatch && formData.confirmPassword && "border-green-500 focus:border-green-500"
            )}
            required
          />
          {/* Match indicator */}
          {touched.confirmPassword && state.passwordsMatch && formData.confirmPassword && (
            <p className="text-xs text-green-600 dark:text-green-400 animate-in slide-in-from-top-2 duration-200">
              Passwords match! ✓
            </p>
          )}
        </div>

        <Button 
          className={cn(
            "w-full mt-4 h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
            "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
            "text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
          )} 
          type="submit" 
          disabled={state.isLoading || !state.isValid || !state.passwordsMatch}
        >
          {state.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Updating password...</span>
            </>
          ) : (
            <span>Update password</span>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground/60">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘/Ctrl+Enter</kbd> to update quickly
        </p>
      </form>
    </div>
  );
}