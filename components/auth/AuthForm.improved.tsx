"use client";

import React, { memo, useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingPasswordInput } from "@/components/ui/floating-password-input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Check, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuthActions } from "@/hooks/useAuthOptimized";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { detectExistingUser } from "@/lib/auth-optimization";

import {
  DEBOUNCE_TIMINGS,
  AUTH_TIMINGS,
  FORM_FIELDS,
  STYLES,
  SUCCESS_MESSAGES,
  USER_DETECTION_INDICATORS,
  USER_DETECTION_CARDS,
  PASSWORD_STRENGTH_DISPLAY,
  KEYBOARD_SHORTCUTS,
  ANIMATIONS,
  LINKS,
  FORM_DEFAULTS,
  LOADING_STATES
} from "@/config/auth-form-config";

import {
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  parseAuthError,
  parseUrlError,
  getToastMessage,
  getUserDetectionMessage,
  getUsernameMessage,
  handleKeyboardShortcut,
  createInitialFormData,
  createInitialTouchedFields,
  handleInputChange,
  handleFieldBlur,
  validateForm,
  isFormValid
} from "@/utils/auth-form-utils";

import type {
  AuthFormProps,
  FormData,
  ValidationErrors,
  TouchedFields,
  UserDetectionResult,
  SubmitPhase,
  GoogleAuthButtonProps,
  EmailFieldProps,
  PasswordFieldProps,
  UsernameFieldProps,
  DisplayNameFieldProps,
  PasswordStrengthIndicatorProps,
  SubmitButtonProps
} from "@/types/auth-form-improved.types";

import { ProgressiveAuthLoader } from "./ProgressiveAuthLoader";

// Google Icon Component
const GoogleIcon = memo(function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
});

// Success/Error Banner Components
const SuccessBanner = memo(function SuccessBanner({ message }: { message: string }) {
  if (!message) return null;
  
  return (
    <div className={STYLES.SUCCESS_BANNER.className}>
      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
        {message}
      </p>
    </div>
  );
});

const ErrorBanner = memo(function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  
  return (
    <div className={STYLES.ERROR_BANNER.className}>
      <p className="text-sm text-red-700 dark:text-red-300 font-medium">
        {message}
      </p>
    </div>
  );
});

// Google Authentication Button
const GoogleAuthButton = memo(function GoogleAuthButton({
  isLoading,
  submitPhase,
  successMessage,
  onGoogleAuth
}: GoogleAuthButtonProps) {
  const renderContent = () => {
    if (isLoading && submitPhase === 'authenticating') {
      return (
        <>
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-purple-600" />
          <span>{successMessage || 'Connecting to Google...'}</span>
        </>
      );
    }
    
    if (isLoading && submitPhase === 'redirecting') {
      return (
        <>
          <div className="mr-3 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
          <span>Redirecting...</span>
        </>
      );
    }
    
    return (
      <>
        <GoogleIcon className="mr-3 h-5 w-5" />
        <span>Continue with Google</span>
      </>
    );
  };

  return (
    <div className="grid gap-2">
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={onGoogleAuth}
        className={STYLES.GOOGLE_BUTTON.className}
      >
        {renderContent()}
      </Button>
      <p className="text-xs text-center text-muted-foreground mt-2">
        One click authentication with your Google account
      </p>
      <p className="text-xs text-center text-muted-foreground/60 mt-1">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">{KEYBOARD_SHORTCUTS.GOOGLE_AUTH.description}</kbd> for quick Google sign-in
      </p>
    </div>
  );
});

// Password Strength Indicator
const PasswordStrengthIndicator = memo(function PasswordStrengthIndicator({
  password,
  show
}: PasswordStrengthIndicatorProps) {
  if (!show || !password) return null;

  const strength = calculatePasswordStrength(password);
  const level = getPasswordStrengthLevel(strength);
  const colors = getPasswordStrengthColor(level);
  const label = getPasswordStrengthLabel(level);

  return (
    <div className={cn("space-y-2", ANIMATIONS.SLIDE_IN.className)}>
      <div className="flex space-x-1">
        {[...Array(PASSWORD_STRENGTH_DISPLAY.BAR_COUNT)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-full rounded-full transition-all duration-300",
              i < strength ? colors.bg : PASSWORD_STRENGTH_DISPLAY.COLORS.INACTIVE.bg,
              i < strength && "shadow-sm"
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <p className={cn("text-xs font-medium transition-colors duration-200", colors.text)}>
          {label}
        </p>
        {strength >= 4 && (
          <div className={ANIMATIONS.ZOOM_IN.className}>
            <Check className="h-3 w-3 text-green-500" />
          </div>
        )}
      </div>
    </div>
  );
});

// User Detection Indicator
const UserDetectionIndicator = memo(function UserDetectionIndicator({
  isDetecting,
  userDetection,
  error,
  touched,
  email
}: {
  isDetecting: boolean;
  userDetection: UserDetectionResult | null;
  error?: string;
  touched: boolean;
  email: string;
}) {
  if (isDetecting) {
    const LoadingIcon = USER_DETECTION_INDICATORS.LOADING.icon;
    return (
      <LoadingIcon 
        className={cn(STYLES.FLOATING_INDICATOR.className, USER_DETECTION_INDICATORS.LOADING.className)}
        aria-label={USER_DETECTION_INDICATORS.LOADING.ariaLabel}
      />
    );
  }

  if (!isDetecting && !error && touched && email && userDetection) {
    if (userDetection.exists) {
      const ExistsIcon = USER_DETECTION_INDICATORS.USER_EXISTS.icon;
      return (
        <ExistsIcon
          className={cn(STYLES.FLOATING_INDICATOR.className, USER_DETECTION_INDICATORS.USER_EXISTS.className)}
          aria-label={USER_DETECTION_INDICATORS.USER_EXISTS.ariaLabel}
        />
      );
    } else {
      const AvailableIcon = USER_DETECTION_INDICATORS.EMAIL_AVAILABLE.icon;
      return (
        <AvailableIcon
          className={cn(STYLES.FLOATING_INDICATOR.className, USER_DETECTION_INDICATORS.EMAIL_AVAILABLE.className)}
          aria-label={USER_DETECTION_INDICATORS.EMAIL_AVAILABLE.ariaLabel}
        />
      );
    }
  }

  if (!isDetecting && !userDetection && !error && touched && email) {
    const ValidIcon = USER_DETECTION_INDICATORS.EMAIL_AVAILABLE.icon;
    return (
      <ValidIcon className={cn(STYLES.FLOATING_INDICATOR.className, USER_DETECTION_INDICATORS.EMAIL_AVAILABLE.className)} />
    );
  }

  return null;
});

// User Detection Feedback
const UserDetectionFeedback = memo(function UserDetectionFeedback({
  userDetection,
  mode,
  error
}: {
  userDetection: UserDetectionResult | null;
  mode: 'signin' | 'signup';
  error?: string;
}) {
  if (!userDetection || error) return null;

  const { message, type, showSigninLink } = getUserDetectionMessage(userDetection, mode);

  if (userDetection.exists) {
    return (
      <div className={cn("text-xs", ANIMATIONS.SLIDE_IN.className)}>
        <div className={USER_DETECTION_CARDS.EMAIL_EXISTS.container}>
          <p className={USER_DETECTION_CARDS.EMAIL_EXISTS.text}>
            <UserCheck className="h-4 w-4" />
            {message}
          </p>
          {showSigninLink && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">Want to sign in instead?</span>
              <Link 
                href={LINKS.SIGNIN_FROM_SIGNUP.href}
                className={USER_DETECTION_CARDS.EMAIL_EXISTS.linkText}
              >
                {LINKS.SIGNIN_FROM_SIGNUP.text}
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div className={cn("text-xs", ANIMATIONS.SLIDE_IN.className)}>
        <div className={USER_DETECTION_CARDS.EMAIL_AVAILABLE.container}>
          <p className={USER_DETECTION_CARDS.EMAIL_AVAILABLE.text}>
            <Check className="h-4 w-4" />
            {message}
          </p>
        </div>
      </div>
    );
  }

  return null;
});

// Email Field Component
const EmailField = memo(function EmailField({
  value,
  onChange,
  onBlur,
  error,
  touched,
  isLoading,
  authError,
  mode,
  userDetection,
  isDetecting
}: EmailFieldProps & { isDetecting: boolean }) {
  return (
    <div className="grid gap-2">
      <div className="relative">
        <FloatingInput
          {...FORM_FIELDS.EMAIL}
          disabled={isLoading}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error || (authError && mode === "signin" ? "Check your email" : "")}
          touched={touched}
          className={cn(
            "input-custom",
            authError && mode === "signin" && STYLES.INPUT_ERROR.className
          )}
        />
        <UserDetectionIndicator
          isDetecting={isDetecting}
          userDetection={userDetection.result}
          error={error}
          touched={touched}
          email={value}
        />
      </div>
      {error && touched && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <UserDetectionFeedback
        userDetection={userDetection.result}
        mode={mode}
        error={error}
      />
    </div>
  );
});

// Password Field Component
const PasswordField = memo(function PasswordField({
  value,
  onChange,
  onBlur,
  error,
  touched,
  isLoading,
  authError,
  mode,
  showStrengthIndicator = false
}: PasswordFieldProps) {
  return (
    <div className="grid gap-2">
      {mode === "signin" && (
        <div className="flex items-center justify-end mb-1">
          <Link
            href={LINKS.FORGOT_PASSWORD.href}
            className={LINKS.FORGOT_PASSWORD.className}
          >
            {LINKS.FORGOT_PASSWORD.text}
          </Link>
        </div>
      )}
      <FloatingPasswordInput
        {...FORM_FIELDS.PASSWORD}
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        disabled={isLoading}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error || (authError && mode === "signin" ? "Check your password" : "")}
        touched={touched}
        className={cn(
          "input-custom",
          authError && mode === "signin" && STYLES.INPUT_ERROR.className
        )}
      />
      {error && touched && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {showStrengthIndicator && (
        <PasswordStrengthIndicator password={value} show={!!value} />
      )}
    </div>
  );
});

// Username Field Component
const UsernameField = memo(function UsernameField({
  value,
  onChange,
  onBlur,
  error,
  touched,
  isLoading,
  usernameCheck
}: UsernameFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="relative">
        <FloatingInput
          {...FORM_FIELDS.USERNAME}
          disabled={isLoading}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          touched={touched}
          className="input-custom"
        />
        {/* Username availability indicator */}
        {usernameCheck.isChecking && (
          <Loader2 className={cn(STYLES.FLOATING_INDICATOR.className, "h-4 w-4 animate-spin text-blue-500")} />
        )}
        {!usernameCheck.isChecking && usernameCheck.available === true && !error && (
          <div className={cn(STYLES.FLOATING_INDICATOR.className, ANIMATIONS.ZOOM_IN.className)}>
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
        {!usernameCheck.isChecking && usernameCheck.available === false && !error && (
          <div className={cn(STYLES.FLOATING_INDICATOR.className, ANIMATIONS.ZOOM_IN.className)}>
            <UserCheck className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      {error && touched && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {/* Username availability feedback */}
      {!error && usernameCheck.available !== null && (
        <p className={cn(
          "text-xs animate-in slide-in-from-top-2 duration-200",
          usernameCheck.available 
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        )}>
          {getUsernameMessage(usernameCheck.available).message}
        </p>
      )}
    </div>
  );
});

// Display Name Field Component
const DisplayNameField = memo(function DisplayNameField({
  value,
  onChange,
  onBlur,
  error,
  touched,
  isLoading
}: DisplayNameFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="relative">
        <FloatingInput
          {...FORM_FIELDS.DISPLAY_NAME}
          disabled={isLoading}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          touched={touched}
          className="input-custom"
        />
        {!error && touched && value && (
          <div className={cn(STYLES.FLOATING_INDICATOR.className, ANIMATIONS.ZOOM_IN.className)}>
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
      {error && touched && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
});

// Submit Button Component
const SubmitButton = memo(function SubmitButton({
  mode,
  isLoading,
  submitPhase,
  successMessage,
  disabled = false
}: SubmitButtonProps) {
  const getButtonContent = () => {
    if (!isLoading) {
      return <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>;
    }

    switch (submitPhase) {
      case 'validating':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Validating...</span>
          </>
        );
      case 'authenticating':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
          </>
        );
      case 'redirecting':
        return (
          <>
            <div className="mr-2 h-4 w-4 bg-green-400 rounded-full flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
            <span>{successMessage || "Success! Redirecting..."}</span>
          </>
        );
      default:
        return <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>;
    }
  };

  return (
    <>
      <Button
        className={cn(
          STYLES.SUBMIT_BUTTON.className,
          submitPhase === 'redirecting' && ANIMATIONS.SUCCESS_PULSE.className
        )}
        type="submit"
        disabled={isLoading || disabled}
      >
        {getButtonContent()}
      </Button>
      <p className="text-xs text-center text-muted-foreground/60 mt-2">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">{KEYBOARD_SHORTCUTS.QUICK_SUBMIT.description}</kbd> to submit quickly
      </p>
    </>
  );
});

// Main AuthForm Component
export const AuthForm = memo(function AuthForm({ mode, onSuccess }: AuthFormProps) {
  // State management
  const [formData, setFormData] = useState<FormData>(createInitialFormData());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>(createInitialTouchedFields());
  const [isLoading, setIsLoading] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userDetection, setUserDetection] = useState<UserDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Debounced values
  const debouncedFormData = useDebounce(formData, DEBOUNCE_TIMINGS.FORM_VALIDATION);
  const debouncedEmail = useDebounce(formData.email, DEBOUNCE_TIMINGS.USER_DETECTION);
  const debouncedUsername = useDebounce(formData.username, DEBOUNCE_TIMINGS.USERNAME_CHECK);

  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle } = useAuthActions();
  const checkUser = useAuthStore((state) => state.checkUser);
  const { validateField, validateForm: hookValidateForm } = useFormValidation({ mode });
  const { checkUsername, cleanup } = useUsernameCheck();

  // URL parameter handling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const authSuccess = urlParams.get("auth");

    if (error) {
      const { title, description } = parseUrlError(error);
      toast({
        title,
        description,
        variant: "destructive",
      });
      router.replace(window.location.pathname);
    }

    if (authSuccess === "success") {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      router.replace(window.location.pathname);
    }
  }, [toast, router]);

  // User detection effect
  useEffect(() => {
    if (debouncedEmail && debouncedEmail.includes("@") && !errors.email) {
      setIsDetecting(true);
      detectExistingUser(debouncedEmail)
        .then(setUserDetection)
        .catch((error) => {
          console.warn("User detection failed:", error);
        })
        .finally(() => setIsDetecting(false));
    } else {
      setUserDetection(null);
    }
  }, [debouncedEmail, errors.email]);

  // Username availability check
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
          if (error.message !== 'Request aborted') {
            setUsernameAvailable(null);
            toast({
              title: "Username check failed",
              description: "Could not verify username availability",
              variant: "destructive",
            });
          }
        })
        .finally(() => setCheckingUsername(false));
    } else {
      setUsernameAvailable(null);
      setCheckingUsername(false);
    }
    
    return cleanup;
  }, [debouncedUsername, mode, errors.username, checkUsername, cleanup, toast]);

  // Auto-validation with debounced values
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

  // Event handlers
  const handleInputChangeCallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = handleInputChange(e, formData, () => setAuthError(null));
    setFormData(newFormData);
  }, [formData]);

  const handleBlurCallback = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { touched: newTouched, error } = handleFieldBlur(e, touched, mode);
    setTouched(newTouched);
    if (error !== undefined) {
      setErrors(prev => ({ ...prev, [e.target.name]: error }));
    }
  }, [touched, mode]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    const formDataForValidation = {
      email: formData.email,
      password: formData.password,
      username: formData.username,
      displayName: formData.displayName,
    };
    
    const validationErrors = validateForm(formDataForValidation, mode);
    setErrors(validationErrors);
    
    if (!isFormValid(validationErrors)) return;

    setAuthError(null);
    setIsLoading(true);
    setSubmitPhase('validating');

    await new Promise(resolve => setTimeout(resolve, AUTH_TIMINGS.VALIDATION_DELAY));
    
    try {
      setSubmitPhase('authenticating');
      
      if (mode === "signin") {
        const response = await signIn(formData.email, formData.password);

        if (response.error) {
          throw response.error;
        }

        if (response.data?.user) {
          setSubmitPhase('redirecting');
          setSuccessMessage(SUCCESS_MESSAGES.SIGNIN);
          
          await new Promise(resolve => setTimeout(resolve, AUTH_TIMINGS.STATE_UPDATE_DELAY));
          await checkUser();
          await new Promise(resolve => setTimeout(resolve, AUTH_TIMINGS.UI_PROPAGATION_DELAY));
          
          router.refresh();
          await new Promise(resolve => setTimeout(resolve, AUTH_TIMINGS.REDIRECT_DELAY));
          
          const { title, description } = getToastMessage(mode);
          toast({ title, description });

          if (onSuccess) {
            onSuccess();
          } else {
            const { getSmartRedirect } = await import("@/lib/auth-optimization");
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
          throw response.error;
        }

        if (response.data?.user) {
          setSubmitPhase('redirecting');
          setSuccessMessage(SUCCESS_MESSAGES.SIGNUP);
          
          await new Promise(resolve => setTimeout(resolve, AUTH_TIMINGS.SUCCESS_DISPLAY));
          
          const { title, description } = getToastMessage(mode);
          toast({ title, description });

          if (onSuccess) {
            onSuccess();
          } else {
            const { getSmartRedirect } = await import("@/lib/auth-optimization");
            const redirectTo = getSmartRedirect(response.data.user);
            router.push(redirectTo);
          }
        } else {
          toast({
            title: "Account created!",
            description: "Please sign in with your new credentials.",
          });
          router.push("/signin");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      
      if (error instanceof Error) {
        const { title, description, fieldError } = parseAuthError(error, mode);
        
        if (fieldError) {
          setAuthError(fieldError);
        }
        
        toast({
          title,
          description,
          variant: "destructive",
        });
      }
    } finally {
      if (submitPhase !== 'redirecting') {
        setIsLoading(false);
        setSubmitPhase('idle');
      }
    }
  }, [formData, mode, validateForm, signIn, signUp, checkUser, router, toast, onSuccess, submitPhase]);

  const handleGoogleAuth = useCallback(async () => {
    setIsLoading(true);
    setSubmitPhase('authenticating');
    
    try {
      setSuccessMessage(SUCCESS_MESSAGES.GOOGLE_CONNECTING);
      await new Promise(resolve => setTimeout(resolve, AUTH_TIMINGS.GOOGLE_CONNECTION_DELAY));
      
      const result = await signInWithGoogle();

      if (result.error) {
        throw result.error;
      }

      if (result.data?.url) {
        setSubmitPhase('redirecting');
        setSuccessMessage(SUCCESS_MESSAGES.GOOGLE_REDIRECTING);
      }
    } catch (error) {
      console.error("Google auth error:", error);
      toast({
        title: "Google Sign-in Failed",
        description: error instanceof Error ? error.message : "Unable to connect to Google. Please try again.",
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
      handleKeyboardShortcut(
        event,
        isLoading,
        handleGoogleAuth,
        () => {
          const form = document.querySelector('form');
          if (form) form.requestSubmit();
        }
      );
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, handleGoogleAuth]);

  return (
    <div className={STYLES.CONTAINER.className}>
      <ProgressiveAuthLoader show={isLoading} />
      <SuccessBanner message={successMessage} />
      <ErrorBanner message={authError || ''} />

      <GoogleAuthButton
        isLoading={isLoading}
        submitPhase={submitPhase}
        successMessage={successMessage}
        onGoogleAuth={handleGoogleAuth}
      />

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

      <form onSubmit={handleSubmit} className={STYLES.FORM.className}>
        <EmailField
          value={formData.email}
          onChange={handleInputChangeCallback}
          onBlur={handleBlurCallback}
          error={errors.email}
          touched={touched.email}
          isLoading={isLoading}
          authError={authError}
          mode={mode}
          userDetection={{ result: userDetection, isDetecting }}
          isDetecting={isDetecting}
        />

        {mode === "signup" && (
          <>
            <UsernameField
              value={formData.username}
              onChange={handleInputChangeCallback}
              onBlur={handleBlurCallback}
              error={errors.username}
              touched={touched.username}
              isLoading={isLoading}
              usernameCheck={{ available: usernameAvailable, isChecking: checkingUsername }}
            />

            <DisplayNameField
              value={formData.displayName}
              onChange={handleInputChangeCallback}
              onBlur={handleBlurCallback}
              error={errors.displayName}
              touched={touched.displayName}
              isLoading={isLoading}
            />
          </>
        )}

        <PasswordField
          value={formData.password}
          onChange={handleInputChangeCallback}
          onBlur={handleBlurCallback}
          error={errors.password}
          touched={touched.password}
          isLoading={isLoading}
          authError={authError}
          mode={mode}
          showStrengthIndicator={mode === "signup"}
        />

        {mode === "signin" && (
          <div className="flex items-center space-x-2">
            <Checkbox
              {...FORM_FIELDS.REMEMBER_ME}
              checked={formData.rememberMe}
              onCheckedChange={(checked: boolean) =>
                setFormData((prev) => ({ ...prev, rememberMe: checked }))
              }
            />
            <Label htmlFor={FORM_FIELDS.REMEMBER_ME.id} className="text-sm">
              {FORM_FIELDS.REMEMBER_ME.label}
            </Label>
          </div>
        )}

        <SubmitButton
          mode={mode}
          isLoading={isLoading}
          submitPhase={submitPhase}
          successMessage={successMessage}
        />
      </form>
    </div>
  );
});