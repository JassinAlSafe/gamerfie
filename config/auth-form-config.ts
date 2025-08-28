/**
 * Configuration constants for AuthForm component
 * Centralizes all authentication-related constants, timing, and UI behavior
 */

import { Loader2, Check, UserCheck } from "lucide-react";

// Debounce timing configuration (in milliseconds)
export const DEBOUNCE_TIMINGS = {
  FORM_VALIDATION: 300,
  USER_DETECTION: 800,
  USERNAME_CHECK: 600
} as const;

// Authentication timing configuration
export const AUTH_TIMINGS = {
  VALIDATION_DELAY: 500,
  SUCCESS_DISPLAY: 1000,
  STATE_UPDATE_DELAY: 200,
  UI_PROPAGATION_DELAY: 300,
  REDIRECT_DELAY: 500,
  GOOGLE_CONNECTION_DELAY: 300
} as const;

// Password strength configuration
export const PASSWORD_STRENGTH = {
  MIN_LENGTH: 8,
  LEVELS: {
    WEAK: 2,
    GOOD: 3,
    STRONG: 4
  },
  CRITERIA: {
    LENGTH: /^.{8,}$/,
    UPPERCASE: /[A-Z]/,
    LOWERCASE: /[a-z]/,
    NUMBERS: /[0-9]/,
    SPECIAL_CHARS: /[^A-Za-z0-9]/
  }
} as const;

// Form submission phases
export const SUBMIT_PHASES = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  AUTHENTICATING: 'authenticating',
  REDIRECTING: 'redirecting'
} as const;

// Authentication modes
export const AUTH_MODES = {
  SIGNIN: 'signin',
  SIGNUP: 'signup'
} as const;

// Form field configuration
export const FORM_FIELDS = {
  EMAIL: {
    id: 'email',
    name: 'email',
    label: 'Email address',
    type: 'email',
    autoCapitalize: 'none',
    autoComplete: 'email',
    autoCorrect: 'off',
    required: true
  },
  PASSWORD: {
    id: 'password',
    name: 'password',
    label: 'Password',
    autoCapitalize: 'none',
    autoCorrect: 'off',
    required: true
  },
  USERNAME: {
    id: 'username',
    name: 'username',
    label: 'Username',
    type: 'text',
    autoCapitalize: 'none',
    autoComplete: 'username',
    autoCorrect: 'off',
    required: true,
    minLength: 3
  },
  DISPLAY_NAME: {
    id: 'displayName',
    name: 'displayName',
    label: 'Display Name',
    type: 'text',
    autoCapitalize: 'words',
    autoComplete: 'name',
    required: true
  },
  REMEMBER_ME: {
    id: 'rememberMe',
    name: 'rememberMe',
    label: 'Remember me'
  }
} as const;

// Error message mapping
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: {
    title: "Login failed",
    description: "The email or password you entered is incorrect. Please check your credentials and try again.",
    fieldError: "Invalid email or password"
  },
  USER_NOT_FOUND: {
    title: "Account not found",
    description: "No account found with this email address. Please check your email or sign up for a new account.",
    fieldError: "Email not found"
  },
  INVALID_EMAIL: {
    title: "Invalid email",
    description: "Please enter a valid email address."
  },
  WEAK_PASSWORD: {
    title: "Weak password",
    description: "Your password is too weak. Please choose a stronger password with at least 8 characters."
  },
  PASSWORD_TOO_SHORT: {
    title: "Password too short",
    description: "Your password must be at least 8 characters long."
  },
  RATE_LIMITED: {
    title: "Too many attempts",
    description: "Too many login attempts. Please wait a few minutes before trying again."
  },
  EMAIL_ALREADY_REGISTERED: {
    title: "Email already registered",
    description: "An account with this email already exists. Try signing in instead."
  },
  CONNECTION_ERROR: {
    title: "Connection problem",
    description: "Unable to connect to our servers. Please check your internet connection and try again."
  },
  EMAIL_NOT_CONFIRMED: {
    title: "Email not verified",
    description: "Please check your email and click the verification link before signing in."
  },
  GOOGLE_AUTH_FAILED: {
    title: "Google Sign-in Failed",
    description: "Unable to connect to Google. Please try again."
  },
  GENERIC_ERROR: {
    signin: {
      title: "Something went wrong",
      description: "We couldn't sign you in right now. Please try again in a few moments."
    },
    signup: {
      title: "Something went wrong", 
      description: "We couldn't create your account right now. Please try again in a few moments."
    }
  }
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SIGNIN: 'Welcome back!',
  SIGNUP: 'Account created successfully!',
  GOOGLE_CONNECTING: 'Connecting to Google...',
  GOOGLE_REDIRECTING: 'Redirecting to Google...',
  TOAST_SIGNIN: {
    title: "Welcome back! 👋",
    description: "Taking you to your dashboard..."
  },
  TOAST_SIGNUP: {
    title: "Welcome to GameVault! 🎉",
    description: "Setting up your gaming experience..."
  }
} as const;

// User detection messages
export const USER_DETECTION_MESSAGES = {
  EMAIL_AVAILABLE: "Perfect! This email is available",
  EMAIL_REGISTERED: "This email is already registered",
  WELCOME_BACK: "Welcome back! We found your account",
  USERNAME_AVAILABLE: "Username is available! ✨",
  USERNAME_TAKEN: "Username is already taken",
  SIGNIN_SUGGESTION: "Want to sign in instead?"
} as const;

// Keyboard shortcuts configuration
export const KEYBOARD_SHORTCUTS = {
  GOOGLE_AUTH: {
    key: 'g',
    modifiers: ['metaKey', 'ctrlKey'],
    description: '⌘/Ctrl+G'
  },
  QUICK_SUBMIT: {
    key: 'Enter',
    modifiers: ['metaKey', 'ctrlKey'],
    description: '⌘/Ctrl+Enter'
  }
} as const;

// Styling configuration
export const STYLES = {
  CONTAINER: {
    className: "grid gap-6"
  },
  SUCCESS_BANNER: {
    className: "bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center animate-in fade-in-50 duration-300"
  },
  ERROR_BANNER: {
    className: "bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center animate-in fade-in-50 duration-300"
  },
  GOOGLE_BUTTON: {
    className: "auth-button w-full h-12 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
  },
  SUBMIT_BUTTON: {
    className: "auth-button w-full mt-2 h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 border-0 hover:border-0 focus:ring-2 focus:ring-purple-500/50"
  },
  FORM: {
    className: "grid gap-4 auth-form-slide-in"
  },
  INPUT_ERROR: {
    className: "border-red-500 focus:border-red-500"
  },
  FLOATING_INDICATOR: {
    className: "absolute right-3 top-1/2 transform -translate-y-1/2"
  }
} as const;

// Password strength visualization
export const PASSWORD_STRENGTH_DISPLAY = {
  COLORS: {
    WEAK: {
      bg: "bg-red-500",
      text: "text-red-600 dark:text-red-400"
    },
    GOOD: {
      bg: "bg-yellow-500", 
      text: "text-yellow-600 dark:text-yellow-400"
    },
    STRONG: {
      bg: "bg-green-500",
      text: "text-green-600 dark:text-green-400"
    },
    INACTIVE: {
      bg: "bg-muted"
    }
  },
  LABELS: {
    WEAK: "🔴 Weak password",
    GOOD: "🟡 Good password",
    STRONG: "🟢 Strong password"
  },
  BAR_COUNT: 5
} as const;

// User detection indicator configuration
export const USER_DETECTION_INDICATORS = {
  LOADING: {
    icon: Loader2,
    className: "h-4 w-4 animate-spin text-blue-500",
    ariaLabel: "Checking email"
  },
  USER_EXISTS: {
    icon: UserCheck,
    className: "h-4 w-4 text-blue-500",
    ariaLabel: "Existing user found"
  },
  EMAIL_AVAILABLE: {
    icon: Check,
    className: "h-4 w-4 text-green-500", 
    ariaLabel: "Email available"
  },
  USERNAME_AVAILABLE: {
    icon: Check,
    className: "h-4 w-4 text-green-500"
  },
  USERNAME_TAKEN: {
    icon: UserCheck,
    className: "h-4 w-4 text-red-500"
  }
} as const;

// User detection card styling
export const USER_DETECTION_CARDS = {
  EMAIL_EXISTS: {
    container: "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3",
    text: "text-blue-700 dark:text-blue-300 flex items-center gap-2",
    linkText: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium underline underline-offset-2"
  },
  EMAIL_AVAILABLE: {
    container: "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3",
    text: "text-green-700 dark:text-green-300 flex items-center gap-2"
  }
} as const;

// Animation configurations
export const ANIMATIONS = {
  FADE_IN: {
    className: "animate-in fade-in-50 duration-300"
  },
  SLIDE_IN: {
    className: "animate-in slide-in-from-top-2 duration-300"
  },
  ZOOM_IN: {
    className: "animate-in zoom-in-50 duration-200"
  },
  SUCCESS_PULSE: {
    className: "success-pulse"
  }
} as const;

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  PASSWORD: {
    required: true,
    minLength: PASSWORD_STRENGTH.MIN_LENGTH,
    message: `Password must be at least ${PASSWORD_STRENGTH.MIN_LENGTH} characters`
  },
  USERNAME: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: "Username can only contain letters, numbers, underscores, and hyphens"
  },
  DISPLAY_NAME: {
    required: true,
    minLength: 1,
    maxLength: 50,
    message: "Display name is required"
  }
} as const;

// URL parameter handling
export const URL_PARAMS = {
  ERROR: 'error',
  AUTH_SUCCESS: 'auth',
  ERROR_TYPES: {
    OAUTH_FAILED: 'oauth_failed',
    AUTH_FAILED: 'auth_failed',
    NO_SESSION: 'no_session',
    CALLBACK_FAILED: 'callback_failed',
    NO_CODE: 'no_code'
  }
} as const;

// Link configurations
export const LINKS = {
  FORGOT_PASSWORD: {
    href: '/forgot-password',
    text: 'Forgot password?',
    className: 'text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200'
  },
  SIGNIN_FROM_SIGNUP: {
    href: '/signin',
    text: 'Sign in here'
  }
} as const;

// Form default values
export const FORM_DEFAULTS = {
  email: "",
  password: "",
  username: "",
  displayName: "",
  rememberMe: false
} as const;

// Loading button content configuration  
export const LOADING_STATES = {
  VALIDATING: {
    icon: Loader2,
    text: "Validating..."
  },
  AUTHENTICATING: {
    signin: {
      icon: Loader2,
      text: "Signing in..."
    },
    signup: {
      icon: Loader2,
      text: "Creating account..."
    }
  },
  REDIRECTING: {
    icon: Check,
    text: "Success! Redirecting...",
    iconWrapper: "mr-2 h-4 w-4 bg-green-400 rounded-full flex items-center justify-center"
  },
  GOOGLE_CONNECTING: {
    icon: Loader2,
    text: "Connecting to Google..."
  },
  GOOGLE_REDIRECTING: {
    icon: Check,
    text: "Redirecting..."
  }
} as const;

// Type exports for configuration
export type AuthMode = typeof AUTH_MODES[keyof typeof AUTH_MODES];
export type SubmitPhase = typeof SUBMIT_PHASES[keyof typeof SUBMIT_PHASES];
export type FormFieldKey = keyof typeof FORM_FIELDS;
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type PasswordStrengthLevel = 'weak' | 'good' | 'strong';