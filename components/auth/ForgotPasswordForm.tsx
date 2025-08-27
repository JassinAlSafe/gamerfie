"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Loader2, ArrowLeft, Mail, Check } from "lucide-react";
import { useAuthActions } from "@/hooks/useAuthOptimized";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { 
  type PasswordResetState,
  type PasswordResetFormData,
  type PasswordResetStep
} from "@/types/auth.types";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<PasswordResetStep>('email');
  const [formData, setFormData] = useState<PasswordResetFormData>({
    email: "",
  });
  const [state, setState] = useState<PasswordResetState>({
    email: "",
    isLoading: false,
    emailSent: false,
    error: null,
    isValidEmail: false,
  });
  const [touched, setTouched] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const debouncedEmail = useDebounce(formData.email, 300);
  const router = useRouter();
  const { toast } = useToast();
  const { resetPassword } = useAuthActions();

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate email format
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Auto-validate email with debounced input
  useEffect(() => {
    if (debouncedEmail && touched) {
      const isValid = validateEmail(debouncedEmail);
      setState(prev => ({ 
        ...prev, 
        isValidEmail: isValid,
        error: !isValid ? "Please enter a valid email address" : null
      }));
    } else if (touched && !debouncedEmail) {
      setState(prev => ({ 
        ...prev, 
        isValidEmail: false,
        error: "Email address is required"
      }));
    }
  }, [debouncedEmail, validateEmail, touched]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prev => ({ ...prev, email: value }));
      
      // Clear any previous errors when user starts typing
      if (state.error) {
        setState(prev => ({ ...prev, error: null }));
      }
    },
    [state.error]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setState(prev => ({ 
        ...prev, 
        error: "Please enter a valid email address",
        isValidEmail: false 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await resetPassword(formData.email);
      
      setState(prev => ({ 
        ...prev, 
        emailSent: true,
        email: formData.email 
      }));
      setStep('email_sent');

      toast({
        title: "Reset email sent! 📧",
        description: "Check your inbox for password reset instructions.",
      });
      
    } catch (error) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Unable to send reset email. Please try again.";
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes("email not found") || message.includes("user not found")) {
          errorMessage = "No account found with this email address.";
        } else if (message.includes("too many requests") || message.includes("rate limit")) {
          errorMessage = "Too many requests. Please wait a few minutes before trying again.";
        } else if (message.includes("network") || message.includes("connection")) {
          errorMessage = "Connection problem. Please check your internet and try again.";
        }
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      setStep('error');
      
      toast({
        title: "Error sending reset email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleRetry = () => {
    setStep('email');
    setState(prev => ({ 
      ...prev, 
      error: null,
      emailSent: false,
      isLoading: false 
    }));
  };

  const handleBackToSignIn = () => {
    router.push("/signin");
  };

  // Keyboard shortcuts
  useEffect(() => {
    // Only add listeners on client side after mounting
    if (!mounted || typeof window === 'undefined') return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Quick submit (Cmd/Ctrl + Enter)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !state.isLoading) {
        event.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }
      
      // Back to signin (Escape)
      if (event.key === 'Escape' && !state.isLoading) {
        handleBackToSignIn();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isLoading, handleBackToSignIn, mounted]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-2 text-center">
          <div className="h-8 w-64 mx-auto bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          <div className="h-4 w-80 mx-auto bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>
        <div className="grid gap-4">
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  // Email sent success view
  if (step === 'email_sent') {
    return (
      <div className="grid gap-6 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500">
          <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent password reset instructions to
          </p>
          <p className="font-medium text-purple-600 dark:text-purple-400">
            {state.email}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Can't find the email? Check your spam folder or contact support if you need help.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex-1"
            >
              Send another email
            </Button>
            <Button
              onClick={handleBackToSignIn}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              Back to Sign In
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to go back to sign in
        </p>
      </div>
    );
  }

  // Main form view
  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Forgot your password?</h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Error banner */}
      {step === 'error' && state.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center animate-in fade-in-50 duration-300">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {state.error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
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
              disabled={state.isLoading}
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={touched ? state.error || "" : ""}
              touched={touched}
              className={cn(
                "input-custom",
                touched && state.error && "border-red-500 focus:border-red-500",
                touched && state.isValidEmail && "border-green-500 focus:border-green-500"
              )}
              required
            />
            {/* Validation indicator */}
            {touched && state.isValidEmail && !state.error && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-in zoom-in-50 duration-200">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
          {touched && state.error && (
            <p className="text-xs text-destructive">{state.error}</p>
          )}
        </div>

        <Button 
          className={cn(
            "w-full mt-2 h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
            "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
            "text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
          )} 
          type="submit" 
          disabled={state.isLoading || !state.isValidEmail}
        >
          {state.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Sending reset email...</span>
            </>
          ) : (
            <span>Send reset email</span>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground/60">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘/Ctrl+Enter</kbd> to send quickly
        </p>
      </form>

      <div className="text-center">
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}