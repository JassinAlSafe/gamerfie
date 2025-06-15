"use client";

import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff, Check, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuthActions } from "@/hooks/useAuthOptimized";
import { cn } from "@/lib/utils";
import {
  detectExistingUser,
  type UserDetectionResult,
} from "@/lib/auth-optimization";
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

interface FormData {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
  rememberMe?: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    username: "",
    displayName: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [userDetection, setUserDetection] =
    useState<UserDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Debounce form data for validation
  const debouncedFormData = useDebounce(formData, 300);
  const debouncedEmail = useDebounce(formData.email, 800); // Longer debounce for user detection

  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle } = useAuthActions();

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
            toast({
              title: "Account Found",
              description:
                "This email is already registered. Try signing in instead.",
              variant: "default",
            });
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

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  }, []);

  const validatePassword = useCallback(
    (password: string) => {
      if (!password) return "Password is required";
      if (mode === "signup" && password.length < 8)
        return "Password must be at least 8 characters";
      return "";
    },
    [mode]
  );

  const validateUsername = useCallback(
    (username: string) => {
      if (mode === "signup" && !username) return "Username is required";
      if (mode === "signup" && username.length < 3)
        return "Username must be at least 3 characters";
      return "";
    },
    [mode]
  );

  const validateField = useCallback(
    (name: string, value: string) => {
      switch (name) {
        case "email":
          return validateEmail(value);
        case "password":
          return validatePassword(value);
        case "username":
          return validateUsername(value);
        case "displayName":
          return mode === "signup" && !value ? "Display name is required" : "";
        default:
          return "";
      }
    },
    [mode, validateEmail, validatePassword, validateUsername]
  );

  // Auto-validate with debounced values
  useEffect(() => {
    Object.keys(touched).forEach((fieldName) => {
      if (touched[fieldName]) {
        const value = debouncedFormData[fieldName as keyof FormData] as string;
        const error = validateField(fieldName, value);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
      }
    });
  }, [debouncedFormData, touched, validateField]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    },
    []
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const validateForm = useCallback(() => {
    const fields =
      mode === "signup"
        ? ["email", "password", "username", "displayName"]
        : ["email", "password"];

    const newErrors: ValidationErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(
        field,
        formData[field as keyof FormData] as string
      );
      if (error) {
        newErrors[field as keyof ValidationErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [mode, formData, validateField]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === "signin") {
        console.log("Attempting signin with:", formData.email);
        const response = await signIn(formData.email, formData.password);

        if (response.error) {
          console.error("Signin error:", response.error);
          throw response.error;
        }

        if (response.data?.user) {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
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
      } else {
        console.log(
          "Attempting signup with:",
          formData.email,
          formData.username
        );
        const response = await signUp(
          formData.email,
          formData.password,
          formData.username!
        );

        if (response.error) {
          console.error("Signup error:", response.error);
          throw response.error;
        }

        toast({
          title: "Account created",
          description: "Please check your email to verify your account",
        });

        router.push("/signin");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${mode === "signin" ? "sign in" : "create account"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      console.log("Starting Google OAuth flow...");
      // Directly trigger Google OAuth
      const result = await signInWithGoogle();

      console.log("Google OAuth result:", result);

      if (result.error) {
        console.error("Google OAuth error:", result.error);
        throw result.error;
      }

      if (result.data?.url) {
        console.log("Redirecting to Google OAuth URL:", result.data.url);
        // OAuth will handle its own redirects
        // Don't reset loading state here since we're redirecting
      }
    } catch (error) {
      console.error("Google auth error:", error);
      // If immediate error, show toast and reset loading state
      toast({
        title: "Authentication Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to authenticate with Google`,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

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

      <div className="grid gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={handleGoogleAuth}
          className="w-full h-12 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-purple-600" />
              <span>Connecting...</span>
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

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={cn(
                "input-custom",
                errors.email &&
                  touched.email &&
                  "border-destructive focus:border-destructive"
              )}
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
            <div className="text-xs">
              {userDetection.exists ? (
                <p className="text-blue-600 flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  {mode === "signup"
                    ? "Account exists. Consider signing in instead."
                    : "Welcome back! Enter your password below."}
                </p>
              ) : (
                mode === "signup" && (
                  <p className="text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Email available for registration
                  </p>
                )
              )}
            </div>
          )}
        </div>

        {mode === "signup" && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  placeholder="Choose a unique username"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={cn(
                    "input-custom",
                    errors.username &&
                      touched.username &&
                      "border-destructive focus:border-destructive"
                  )}
                  required
                />
                {!errors.username && touched.username && formData.username && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.username && touched.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </Label>
              <div className="relative">
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="Enter your display name"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  disabled={isLoading}
                  value={formData.displayName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={cn(
                    "input-custom",
                    errors.displayName &&
                      touched.displayName &&
                      "border-destructive focus:border-destructive"
                  )}
                  required
                />
                {!errors.displayName &&
                  touched.displayName &&
                  formData.displayName && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
              </div>
              {errors.displayName && touched.displayName && (
                <p className="text-xs text-destructive">{errors.displayName}</p>
              )}
            </div>
          </>
        )}

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            {mode === "signin" && (
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={
                mode === "signin"
                  ? "Enter your password"
                  : "Create a secure password"
              }
              autoCapitalize="none"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              autoCorrect="off"
              disabled={isLoading}
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={cn(
                "input-custom pr-10",
                errors.password &&
                  touched.password &&
                  "border-destructive focus:border-destructive"
              )}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
          {mode === "signup" && formData.password && (
            <div className="space-y-1">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 w-full rounded-full",
                      i < passwordStrength
                        ? passwordStrength <= 2
                          ? "bg-red-500"
                          : passwordStrength <= 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {passwordStrength <= 2 && "Weak password"}
                {passwordStrength === 3 && "Good password"}
                {passwordStrength >= 4 && "Strong password"}
              </p>
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

        <Button className="w-full mt-2" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
