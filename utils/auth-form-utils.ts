/**
 * Pure utility functions for AuthForm component
 * Handles all authentication business logic with no side effects
 */

import { 
  PASSWORD_STRENGTH,
  ERROR_MESSAGES,
  VALIDATION_RULES,
  URL_PARAMS,
  SUCCESS_MESSAGES,
  USER_DETECTION_MESSAGES,
  type AuthMode,
  type SubmitPhase,
  type PasswordStrengthLevel,
  type ErrorMessageKey
} from "@/config/auth-form-config";

// Form data interface
export interface FormData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  rememberMe: boolean;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
}

export interface TouchedFields {
  email: boolean;
  password: boolean;
  username: boolean;
  displayName: boolean;
}

export interface UserDetectionResult {
  exists: boolean;
  email?: string;
  canSignIn?: boolean;
}

// Password strength calculation
export function calculatePasswordStrength(password: string): number {
  let strength = 0;
  
  if (PASSWORD_STRENGTH.CRITERIA.LENGTH.test(password)) strength++;
  if (PASSWORD_STRENGTH.CRITERIA.UPPERCASE.test(password)) strength++;
  if (PASSWORD_STRENGTH.CRITERIA.LOWERCASE.test(password)) strength++;
  if (PASSWORD_STRENGTH.CRITERIA.NUMBERS.test(password)) strength++;
  if (PASSWORD_STRENGTH.CRITERIA.SPECIAL_CHARS.test(password)) strength++;
  
  return strength;
}

export function getPasswordStrengthLevel(strength: number): PasswordStrengthLevel {
  if (strength <= PASSWORD_STRENGTH.LEVELS.WEAK) return 'weak';
  if (strength === PASSWORD_STRENGTH.LEVELS.GOOD) return 'good';
  return 'strong';
}

export function getPasswordStrengthColor(level: PasswordStrengthLevel): {
  bg: string;
  text: string;
} {
  const colors = {
    weak: { bg: "bg-red-500", text: "text-red-600 dark:text-red-400" },
    good: { bg: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400" },
    strong: { bg: "bg-green-500", text: "text-green-600 dark:text-green-400" }
  };
  
  return colors[level];
}

export function getPasswordStrengthLabel(level: PasswordStrengthLevel): string {
  const labels = {
    weak: "🔴 Weak password",
    good: "🟡 Good password", 
    strong: "🟢 Strong password"
  };
  
  return labels[level];
}

// Form validation
export function validateEmail(email: string): string | undefined {
  if (!email) {
    return VALIDATION_RULES.EMAIL.message;
  }
  
  if (!VALIDATION_RULES.EMAIL.pattern.test(email)) {
    return VALIDATION_RULES.EMAIL.message;
  }
  
  return undefined;
}

export function validatePassword(password: string, mode: AuthMode): string | undefined {
  if (!password) {
    return VALIDATION_RULES.PASSWORD.message;
  }
  
  if (mode === 'signup' && password.length < VALIDATION_RULES.PASSWORD.minLength) {
    return VALIDATION_RULES.PASSWORD.message;
  }
  
  return undefined;
}

export function validateUsername(username: string): string | undefined {
  if (!username) {
    return VALIDATION_RULES.USERNAME.message;
  }
  
  if (username.length < VALIDATION_RULES.USERNAME.minLength) {
    return `Username must be at least ${VALIDATION_RULES.USERNAME.minLength} characters`;
  }
  
  if (username.length > VALIDATION_RULES.USERNAME.maxLength) {
    return `Username must be no more than ${VALIDATION_RULES.USERNAME.maxLength} characters`;
  }
  
  if (!VALIDATION_RULES.USERNAME.pattern.test(username)) {
    return VALIDATION_RULES.USERNAME.message;
  }
  
  return undefined;
}

export function validateDisplayName(displayName: string): string | undefined {
  if (!displayName || displayName.trim().length === 0) {
    return VALIDATION_RULES.DISPLAY_NAME.message;
  }
  
  if (displayName.length > VALIDATION_RULES.DISPLAY_NAME.maxLength) {
    return `Display name must be no more than ${VALIDATION_RULES.DISPLAY_NAME.maxLength} characters`;
  }
  
  return undefined;
}

export function validateField(
  fieldName: keyof FormData,
  value: string,
  mode: AuthMode
): string | undefined {
  switch (fieldName) {
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value, mode);
    case 'username':
      return validateUsername(value);
    case 'displayName':
      return validateDisplayName(value);
    default:
      return undefined;
  }
}

export function validateForm(
  formData: Omit<FormData, 'rememberMe'>,
  mode: AuthMode
): ValidationErrors {
  const errors: ValidationErrors = {};
  
  // Always validate email and password
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password, mode);
  if (passwordError) errors.password = passwordError;
  
  // Additional validation for signup
  if (mode === 'signup') {
    const usernameError = validateUsername(formData.username);
    if (usernameError) errors.username = usernameError;
    
    const displayNameError = validateDisplayName(formData.displayName);
    if (displayNameError) errors.displayName = displayNameError;
  }
  
  return errors;
}

// Error handling utilities
export function parseAuthError(
  error: Error,
  mode: AuthMode
): { title: string; description: string; fieldError?: string } {
  const message = error.message.toLowerCase();
  
  // Handle specific authentication errors
  if (message.includes("invalid credentials") || message.includes("invalid login credentials")) {
    return {
      title: ERROR_MESSAGES.INVALID_CREDENTIALS.title,
      description: ERROR_MESSAGES.INVALID_CREDENTIALS.description,
      fieldError: ERROR_MESSAGES.INVALID_CREDENTIALS.fieldError
    };
  }
  
  if (message.includes("email not found") || message.includes("user not found")) {
    return {
      title: ERROR_MESSAGES.USER_NOT_FOUND.title,
      description: ERROR_MESSAGES.USER_NOT_FOUND.description,
      fieldError: ERROR_MESSAGES.USER_NOT_FOUND.fieldError
    };
  }
  
  if (message.includes("invalid email") || (message.includes("email") && message.includes("invalid"))) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  
  if (message.includes("weak password") || (message.includes("password") && message.includes("weak"))) {
    return ERROR_MESSAGES.WEAK_PASSWORD;
  }
  
  if (message.includes("password") && message.includes("short")) {
    return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
  }
  
  if (message.includes("too many requests") || message.includes("rate limit")) {
    return ERROR_MESSAGES.RATE_LIMITED;
  }
  
  if (message.includes("email") && message.includes("already") && message.includes("registered")) {
    return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
  }
  
  if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
    return ERROR_MESSAGES.CONNECTION_ERROR;
  }
  
  if (message.includes("email not confirmed") || message.includes("confirmation")) {
    return ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
  }
  
  // Generic error
  return ERROR_MESSAGES.GENERIC_ERROR[mode];
}

export function parseUrlError(errorParam: string): {
  title: string;
  description: string;
} {
  switch (errorParam) {
    case URL_PARAMS.ERROR_TYPES.OAUTH_FAILED:
      return {
        title: "Authentication Error",
        description: "Google sign-in failed. Please try again."
      };
    case URL_PARAMS.ERROR_TYPES.AUTH_FAILED:
      return {
        title: "Authentication Error",
        description: "Authentication failed. Please check your credentials."
      };
    case URL_PARAMS.ERROR_TYPES.NO_SESSION:
      return {
        title: "Authentication Error",
        description: "Could not establish session. Please try again."
      };
    case URL_PARAMS.ERROR_TYPES.CALLBACK_FAILED:
      return {
        title: "Authentication Error",
        description: "Authentication callback failed. Please try again."
      };
    case URL_PARAMS.ERROR_TYPES.NO_CODE:
      return {
        title: "Authentication Error",
        description: "Invalid authentication request. Please try again."
      };
    default:
      return {
        title: "Authentication Error",
        description: "Authentication failed. Please try again."
      };
  }
}

// Success message utilities
export function getSuccessMessage(phase: SubmitPhase, mode: AuthMode): string {
  switch (phase) {
    case 'redirecting':
      return mode === 'signin' 
        ? SUCCESS_MESSAGES.SIGNIN 
        : SUCCESS_MESSAGES.SIGNUP;
    default:
      return '';
  }
}

export function getToastMessage(mode: AuthMode): { title: string; description: string } {
  return mode === 'signin' 
    ? SUCCESS_MESSAGES.TOAST_SIGNIN
    : SUCCESS_MESSAGES.TOAST_SIGNUP;
}

// User detection utilities
export function getUserDetectionMessage(
  userDetection: UserDetectionResult,
  mode: AuthMode
): {
  message: string;
  type: 'success' | 'info';
  showSigninLink: boolean;
} {
  if (userDetection.exists) {
    return {
      message: mode === 'signup' 
        ? USER_DETECTION_MESSAGES.EMAIL_REGISTERED
        : USER_DETECTION_MESSAGES.WELCOME_BACK,
      type: 'info',
      showSigninLink: mode === 'signup'
    };
  }
  
  return {
    message: USER_DETECTION_MESSAGES.EMAIL_AVAILABLE,
    type: 'success',
    showSigninLink: false
  };
}

export function getUsernameMessage(available: boolean | null): {
  message: string;
  type: 'success' | 'error' | null;
} {
  if (available === null) return { message: '', type: null };
  
  return {
    message: available 
      ? USER_DETECTION_MESSAGES.USERNAME_AVAILABLE
      : USER_DETECTION_MESSAGES.USERNAME_TAKEN,
    type: available ? 'success' : 'error'
  };
}

// Keyboard shortcut utilities
export function handleKeyboardShortcut(
  event: KeyboardEvent,
  isLoading: boolean,
  onGoogleAuth: () => void,
  onQuickSubmit: () => void
): boolean {
  // Google OAuth shortcut (Cmd/Ctrl + G)
  if ((event.metaKey || event.ctrlKey) && event.key === 'g' && !isLoading) {
    event.preventDefault();
    onGoogleAuth();
    return true;
  }
  
  // Quick submit (Cmd/Ctrl + Enter)
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !isLoading) {
    event.preventDefault();
    onQuickSubmit();
    return true;
  }
  
  return false;
}

// Form state utilities
export function createInitialFormData(): FormData {
  return {
    email: "",
    password: "",
    username: "",
    displayName: "",
    rememberMe: false
  };
}

export function createInitialTouchedFields(): TouchedFields {
  return {
    email: false,
    password: false,
    username: false,
    displayName: false
  };
}

export function shouldShowField(fieldName: keyof FormData, mode: AuthMode): boolean {
  if (mode === 'signin') {
    return ['email', 'password', 'rememberMe'].includes(fieldName);
  }
  
  return ['email', 'password', 'username', 'displayName'].includes(fieldName);
}

// Input change utilities
export function handleInputChange(
  event: React.ChangeEvent<HTMLInputElement>,
  currentData: FormData,
  clearAuthError?: () => void
): FormData {
  const { name, value, type, checked } = event.target;
  const fieldValue = type === "checkbox" ? checked : value;

  // Clear authentication error when user starts typing
  if (clearAuthError && (name === "email" || name === "password")) {
    clearAuthError();
  }

  // Type-safe form data update
  if (name in currentData) {
    if (typeof fieldValue === 'string') {
      return {
        ...currentData,
        [name as keyof FormData]: fieldValue
      };
    } else if (name === 'rememberMe' && typeof fieldValue === 'boolean') {
      return {
        ...currentData,
        rememberMe: fieldValue
      };
    }
  }

  return currentData;
}

export function handleFieldBlur(
  event: React.FocusEvent<HTMLInputElement>,
  currentTouched: TouchedFields,
  mode: AuthMode
): {
  touched: TouchedFields;
  error: string | undefined;
} {
  const { name, value } = event.target;
  
  if (name in currentTouched) {
    const newTouched = {
      ...currentTouched,
      [name as keyof TouchedFields]: true
    };
    
    const error = validateField(name as keyof FormData, value, mode);
    
    return {
      touched: newTouched,
      error
    };
  }
  
  return {
    touched: currentTouched,
    error: undefined
  };
}

// Loading state utilities
export function getLoadingContent(
  phase: SubmitPhase,
  mode: AuthMode,
  successMessage?: string
): {
  icon: any;
  text: string;
  iconWrapper?: string;
} {
  switch (phase) {
    case 'validating':
      return {
        icon: 'Loader2',
        text: "Validating..."
      };
    case 'authenticating':
      return {
        icon: 'Loader2',
        text: mode === 'signin' ? "Signing in..." : "Creating account..."
      };
    case 'redirecting':
      return {
        icon: 'Check',
        text: successMessage || "Success! Redirecting...",
        iconWrapper: "mr-2 h-4 w-4 bg-green-400 rounded-full flex items-center justify-center"
      };
    default:
      return {
        icon: null,
        text: mode === 'signin' ? "Sign In" : "Create Account"
      };
  }
}

// Utility type guards
export function isFormValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}

export function hasFieldError(
  fieldName: keyof ValidationErrors,
  errors: ValidationErrors,
  touched: TouchedFields
): boolean {
  return !!(errors[fieldName] && touched[fieldName]);
}