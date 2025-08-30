"use client";

import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingPasswordInput } from "@/components/ui/floating-password-input";
import { Loader2, Check, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuthActions, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { cn } from "@/lib/utils";
import {
  detectExistingUser,
} from "@/lib/auth-optimization";
import {
  type UserDetectionResult,
  type FormData,
  type ValidationErrors,
  type TouchedFields,
} from "@/types/auth-form.types";
import { ProgressiveAuthLoader } from "./ProgressiveAuthLoader";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
    />
  </svg>
);

interface AuthFormProps {
  mode: "signin" | "signup";
  onSuccess?: () => void;
}


export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'validating' | 'authenticating' | 'redirecting'>('idle');
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    username: "",
    displayName: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    password: false,
    username: false,
    displayName: false,
  });
  const [userDetection, setUserDetection] =
    useState<UserDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Debounce form data for validation
  const debouncedFormData = useDebounce(formData, 300);
  const debouncedEmail = useDebounce(formData.email, 800); // Longer debounce for user detection
  const debouncedUsername = useDebounce(formData.username, 600); // Username availability check

  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle } = useAuthActions();
  const { checkUser } = useAuthActions();
  const { validateField, validateForm } = useFormValidation({ mode });
  const { checkUsername, cleanup } = useUsernameCheck();

  // Check for auth errors in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const authSuccess = urlParams.get("auth");

    if (error) {
      let errorMessage = "Authentication failed. Please try again.";

      switch (error) {
        case "oauth_failed":
          errorMessage = "Google sign-in failed. Please try again.";
          break;
        case "auth_failed":
          errorMessage =
            "Authentication failed. Please check your credentials.";
          break;
        case "no_session":
          errorMessage = "Could not establish session. Please try again.";
          break;
        case "callback_failed":
          errorMessage = "Authentication callback failed. Please try again.";
          break;
        case "no_code":
          errorMessage = "Invalid authentication request. Please try again.";
          break;
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Clean up URL parameters
      router.replace(window.location.pathname);
    }

    if (authSuccess === "success") {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Clean up URL parameters
      router.replace(window.location.pathname);
    }
  }, [toast, router]);

  // Smart user detection on email input
  useEffect(() => {
    if (debouncedEmail && debouncedEmail.includes("@") && !errors.email) {
      setIsDetecting(true);
      detectExistingUser(debouncedEmail)
        .then((detection) => {
          setUserDetection(detection);

          // Show helpful message based on detection
          if (detection.exists && mode === "signup") {
            // Don't show toast immediately - let user decide
            // We'll show this info in the UI instead
          }
        })
        .catch((error) => {
          console.warn("User detection failed:", error);
        })
        .finally(() => {
          setIsDetecting(false);
        });
    } else {
      setUserDetection(null);
    }
  }, [debouncedEmail, errors.email, mode, toast]);

  // Username availability check for signup
  useEffect(() => {
    if (mode === "signup" && debouncedUsername && debouncedUsername.length >= 3 && !errors.username) {
      setCheckingUsername(true);
      
      checkUsername(debouncedUsername)
        .then((result) => {
          setUsernameAvailable(result.available);
          if (!result.available && result.reason) {
            setErrors(prev => ({ ...prev, username: result.reason }));
          }
        })
        .catch((error) => {
          console.error('Username check failed:', error);
          // Don't block the user if API fails, just show warning
          if (error.message !== 'Request aborted') {
            setUsernameAvailable(null);
            toast({
              title: "Username check failed",
              description: "Could not verify username availability",
              variant: "destructive",
            });
          }
        })
        .finally(() => {
          setCheckingUsername(false);
        });
    } else {
      setUsernameAvailable(null);
      setCheckingUsername(false);
    }
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [debouncedUsername, mode, errors.username, checkUsername, cleanup, toast]);


  // Auto-validate with debounced values
  useEffect(() => {
    const fields = Object.keys(touched) as (keyof TouchedFields)[];
    fields.forEach((fieldName) => {
      if (touched[fieldName]) {
        const value = debouncedFormData[fieldName];
        const error = validateField(fieldName, value);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
      }
    });
  }, [debouncedFormData, touched, validateField]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      // Clear authentication error when user starts typing
      if (authError && (name === "email" || name === "password")) {
        setAuthError(null);
      }

      // Type-safe form data update
      if (name in formData && typeof fieldValue === 'string') {
        setFormData((prev) => ({ 
          ...prev, 
          [name as keyof FormData]: fieldValue 
        }));
      } else if (name === 'rememberMe' && typeof fieldValue === 'boolean') {
        // Handle checkbox separately since it's not in FormData interface
        setFormData((prev) => ({ 
          ...prev, 
          rememberMe: fieldValue 
        }));
      }
    },
    [authError]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      
      // Type-safe field name validation
      if (name in formData) {
        setTouched((prev) => ({ ...prev, [name as keyof TouchedFields]: true }));
        
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name as keyof ValidationErrors]: error }));
      }
    },
    [validateField, formData]
  );


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form using custom hook - convert FormData to Record<string, string>
    const formDataForValidation = {
      email: formData.email,
      password: formData.password,
      username: formData.username,
      displayName: formData.displayName,
    };
    const errors = validateForm(formDataForValidation);
    setErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    // Clear any previous auth errors
    setAuthError(null);
    setIsLoading(true);
    setSubmitPhase('validating');

    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      setSubmitPhase('authenticating');
      
      if (mode === "signin") {
        const response = await signIn(formData.email, formData.password);

        if (response.error) {
          console.error("Signin error:", response.error);
          
          // Since email confirmation is disabled, this error shouldn't occur
          // but if it does, handle it gracefully
          if (response.error.message === "Email not confirmed") {
            toast({
              title: "Account Issue",
              description: "There seems to be an issue with your account. Please try signing up again.",
              variant: "destructive",
            });
            router.push("/signup");
            return;
          }
          
          throw response.error;
        }

        if (response.data?.user) {
          setSubmitPhase('redirecting');
          setSuccessMessage('Welcome back!');
          
          // Wait a small delay to ensure auth store state is updated
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Force auth state refresh to update header immediately
          await checkUser();
          
          // Additional delay to ensure UI state propagation
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Force router refresh to ensure header updates
          router.refresh();
          
          // Show success state briefly before redirect
          await new Promise(resolve => setTimeout(resolve, 500));
          
          toast({
            title: "Welcome back! 👋",
            description: "Taking you to your dashboard...",
          });

          if (onSuccess) {
            onSuccess();
          } else {
            // Use smart redirect
            const { getSmartRedirect } = await import(
              "@/lib/auth-optimization"
            );
            const redirectTo = getSmartRedirect(response.data.user);
            router.push(redirectTo);
          }
        }
      } else if (mode === "signup") {
        const response = await signUp(
          formData.email,
          formData.password,
          formData.username!,
          formData.displayName
        );

        if (response.error) {
          console.error("Signup error:", response.error);
          throw response.error;
        }

        // Check if user was automatically signed in (email confirmation disabled)
        if (response.data?.user) {
          setSubmitPhase('redirecting');
          setSuccessMessage('Account created successfully!');
          
          // Show success state briefly before redirect
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          toast({
            title: "Welcome to GameVault! 🎉",
            description: "Setting up your gaming experience...",
          });

          if (onSuccess) {
            onSuccess();
          } else {
            // Use smart redirect for new users
            const { getSmartRedirect } = await import("@/lib/auth-optimization");
            const redirectTo = getSmartRedirect(response.data.user);
            router.push(redirectTo);
          }
        } else {
          // Fallback - shouldn't happen with email confirmation disabled
          toast({
            title: "Account created!",
            description: "Please sign in with your new credentials.",
          });
          router.push("/signin");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      
      // Enhanced error messages for better user experience
      let errorTitle = "Authentication failed";
      let errorDescription = `Unable to ${mode === "signin" ? "sign you in" : "create your account"}`;
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        // Handle specific authentication errors
        if (message.includes("invalid credentials") || message.includes("invalid login credentials")) {
          errorTitle = mode === "signin" ? "Login failed" : "Authentication failed";
          errorDescription = mode === "signin" 
            ? "The email or password you entered is incorrect. Please check your credentials and try again."
            : "Please check your email and password and try again.";
          // Set auth error to highlight the problematic fields
          setAuthError("Invalid email or password");
        } else if (message.includes("email not found") || message.includes("user not found")) {
          errorTitle = "Account not found";
          errorDescription = "No account found with this email address. Please check your email or sign up for a new account.";
          setAuthError("Email not found");
        } else if (message.includes("invalid email") || message.includes("email") && message.includes("invalid")) {
          errorTitle = "Invalid email";
          errorDescription = "Please enter a valid email address.";
        } else if (message.includes("weak password") || (message.includes("password") && message.includes("weak"))) {
          errorTitle = "Weak password";
          errorDescription = "Your password is too weak. Please choose a stronger password with at least 8 characters.";
        } else if (message.includes("password") && message.includes("short")) {
          errorTitle = "Password too short";
          errorDescription = "Your password must be at least 8 characters long.";
        } else if (message.includes("too many requests") || message.includes("rate limit")) {
          errorTitle = "Too many attempts";
          errorDescription = "Too many login attempts. Please wait a few minutes before trying again.";
        } else if (message.includes("email") && message.includes("already") && message.includes("registered")) {
          errorTitle = "Email already registered";
          errorDescription = "An account with this email already exists. Try signing in instead.";
        } else if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
          errorTitle = "Connection problem";
          errorDescription = "Unable to connect to our servers. Please check your internet connection and try again.";
        } else if (message.includes("email not confirmed") || message.includes("confirmation")) {
          errorTitle = "Email not verified";
          errorDescription = "Please check your email and click the verification link before signing in.";
        } else {
          // For any other error, show a more user-friendly message
          errorTitle = "Something went wrong";
          errorDescription = mode === "signin" 
            ? "We couldn't sign you in right now. Please try again in a few moments."
            : "We couldn't create your account right now. Please try again in a few moments.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      if (submitPhase !== 'redirecting') {
        setIsLoading(false);
        setSubmitPhase('idle');
      }
    }
  };

  const handleGoogleAuth = useCallback(async () => {
    setIsLoading(true);
    setSubmitPhase('authenticating');
    
    try {
      // Show connecting to Google message
      setSuccessMessage('Connecting to Google...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await signInWithGoogle();


      if (result.error) {
        console.error("Google OAuth error:", result.error);
        throw result.error;
      }

      if (result.data?.url) {
        setSubmitPhase('redirecting');
        setSuccessMessage('Redirecting to Google...');
        // OAuth will handle its own redirects
        // Don't reset loading state here since we're redirecting
      }
    } catch (error) {
      console.error("Google auth error:", error);
      // If immediate error, show toast and reset loading state
      toast({
        title: "Google Sign-in Failed",
        description:
          error instanceof Error
            ? error.message
            : `Unable to connect to Google. Please try again.`,
        variant: "destructive",
      });
      setIsLoading(false);
      setSubmitPhase('idle');
      setSuccessMessage('');
    }
  }, [signInWithGoogle, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Google OAuth shortcut (Cmd/Ctrl + G)
      if ((event.metaKey || event.ctrlKey) && event.key === 'g' && !isLoading) {
        event.preventDefault();
        handleGoogleAuth();
      }
      
      // Quick submit (Cmd/Ctrl + Enter)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !isLoading) {
        event.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, handleGoogleAuth]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength =
    mode === "signup" ? getPasswordStrength(formData.password) : 0;

  return (
    <div className="grid gap-6">
      {/* Progressive loading indicator */}
      <ProgressiveAuthLoader show={isLoading} />
      
      {/* Success message overlay */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center animate-in fade-in-50 duration-300">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            {successMessage}
          </p>
        </div>
      )}

      {/* Authentication error banner */}
      {authError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center animate-in fade-in-50 duration-300">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {authError}
          </p>
        </div>
      )}

      <div className="grid gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={handleGoogleAuth}
          className="auth-button w-full h-12 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading && submitPhase === 'authenticating' ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-purple-600" />
              <span>{successMessage || 'Connecting to Google...'}</span>
            </>
          ) : isLoading && submitPhase === 'redirecting' ? (
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

      <form onSubmit={handleSubmit} className="grid gap-4 auth-form-slide-in">
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
              disabled={isLoading}
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.email || (authError && mode === "signin" ? "Check your email" : "")}
              touched={touched.email}
              className={cn("input-custom", authError && mode === "signin" && "border-red-500 focus:border-red-500")}
              required
            />
            {/* Smart user detection indicators */}
            {isDetecting && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
            )}
            {!isDetecting &&
              !errors.email &&
              touched.email &&
              formData.email &&
              userDetection && (
                <>
                  {userDetection.exists ? (
                    <UserCheck
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500"
                      aria-label="Existing user found"
                    />
                  ) : (
                    <Check
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500"
                      aria-label="Email available"
                    />
                  )}
                </>
              )}
            {!isDetecting &&
              !userDetection &&
              !errors.email &&
              touched.email &&
              formData.email && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
          </div>
          {errors.email && touched.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
          {/* Smart user detection feedback */}
          {userDetection && !errors.email && (
            <div className="text-xs animate-in slide-in-from-top-2 duration-300">
              {userDetection.exists ? (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    {mode === "signup"
                      ? "This email is already registered"
                      : "Welcome back! We found your account"}
                  </p>
                  {mode === "signup" && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400">Want to sign in instead?</span>
                      <Link href="/signin" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium underline underline-offset-2">
                        Sign in here
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                mode === "signup" && (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-green-700 dark:text-green-300 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Perfect! This email is available
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {mode === "signup" && (
          <>
            <div className="grid gap-2">
              <div className="relative">
                <FloatingInput
                  id="username"
                  name="username"
                  label="Username"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  error={errors.username}
                  touched={touched.username}
                  className="input-custom"
                  required
                />
                {/* Username availability indicator */}
                {checkingUsername && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                )}
                {!checkingUsername && usernameAvailable === true && !errors.username && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-in zoom-in-50 duration-200">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {!checkingUsername && usernameAvailable === false && !errors.username && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-in zoom-in-50 duration-200">
                    <UserCheck className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {errors.username && touched.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
              {/* Username availability feedback */}
              {!errors.username && usernameAvailable === false && (
                <p className="text-xs text-red-600 dark:text-red-400 animate-in slide-in-from-top-2 duration-200">
                  Username is already taken
                </p>
              )}
              {!errors.username && usernameAvailable === true && (
                <p className="text-xs text-green-600 dark:text-green-400 animate-in slide-in-from-top-2 duration-200">
                  Username is available! ✨
                </p>
              )}
            </div>

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
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  error={errors.displayName}
                  touched={touched.displayName}
                  className="input-custom"
                  required
                />
                {!errors.displayName &&
                  touched.displayName &&
                  formData.displayName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-in zoom-in-50 duration-200">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
              </div>
              {errors.displayName && touched.displayName && (
                <p className="text-xs text-destructive">{errors.displayName}</p>
              )}
            </div>
          </>
        )}

        <div className="grid gap-2">
          {mode === "signin" && (
            <div className="flex items-center justify-end mb-1">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>
          )}
          <FloatingPasswordInput
            id="password"
            name="password"
            label="Password"
            autoCapitalize="none"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            autoCorrect="off"
            disabled={isLoading}
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            error={errors.password || (authError && mode === "signin" ? "Check your password" : "")}
            touched={touched.password}
            className={cn("input-custom", authError && mode === "signin" && "border-red-500 focus:border-red-500")}
            required
          />
          {errors.password && touched.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
          {mode === "signup" && formData.password && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-full rounded-full transition-all duration-300",
                      i < passwordStrength
                        ? passwordStrength <= 2
                          ? "bg-red-500 shadow-sm"
                          : passwordStrength <= 3
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
                  passwordStrength <= 2 && "text-red-600 dark:text-red-400",
                  passwordStrength === 3 && "text-yellow-600 dark:text-yellow-400",
                  passwordStrength >= 4 && "text-green-600 dark:text-green-400"
                )}>
                  {passwordStrength <= 2 && "🔴 Weak password"}
                  {passwordStrength === 3 && "🟡 Good password"}
                  {passwordStrength >= 4 && "🟢 Strong password"}
                </p>
                {passwordStrength >= 4 && (
                  <div className="animate-in zoom-in-50 duration-200">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {mode === "signin" && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked: boolean) =>
                setFormData((prev) => ({ ...prev, rememberMe: checked }))
              }
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Remember me
            </Label>
          </div>
        )}

        <Button 
          className={cn(
            "auth-button w-full mt-2 h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
            "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
            "text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
            "border-0 hover:border-0 focus:ring-2 focus:ring-purple-500/50",
            submitPhase === 'redirecting' && "success-pulse"
          )} 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              {submitPhase === 'validating' && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Validating...</span>
                </>
              )}
              {submitPhase === 'authenticating' && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
                </>
              )}
              {submitPhase === 'redirecting' && (
                <>
                  <div className="mr-2 h-4 w-4 bg-green-400 rounded-full flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span>{successMessage || "Success! Redirecting..."}</span>
                </>
              )}
            </>
          ) : (
            <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground/60 mt-2">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘/Ctrl+Enter</kbd> to submit quickly
        </p>
      </form>
    </div>
  );
}
