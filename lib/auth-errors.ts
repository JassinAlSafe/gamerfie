/**
 * Authentication Error Handling Utilities
 * Type-safe error management with user-friendly messages
 */

import type { AuthError } from '@supabase/supabase-js';

export interface AuthErrorDetails {
  code: string;
  message: string;
  context?: 'signin' | 'signup' | 'reset' | 'update' | 'oauth';
  field?: 'email' | 'password' | 'username' | 'general';
  userMessage: string;
}

/**
 * Map Supabase auth errors to user-friendly messages
 * SECURITY: Generic messages prevent information disclosure
 */
const ERROR_MAPPINGS: Record<string, Partial<AuthErrorDetails>> = {
  // Generic authentication error (prevents account enumeration)
  'invalid_credentials': {
    userMessage: 'Invalid email or password. Please try again.',
    field: 'general'
  },
  'user_not_found': {
    userMessage: 'Invalid email or password. Please try again.',
    field: 'general'
  },
  'email_not_confirmed': {
    userMessage: 'Please verify your email address before signing in.',
    field: 'email'
  },
  'weak_password': {
    userMessage: 'Password must be at least 8 characters long.',
    field: 'password'
  },
  'user_already_exists': {
    userMessage: 'An account with this email already exists.',
    field: 'email'
  },
  'rate_limit_exceeded': {
    userMessage: 'Too many attempts. Please try again later.',
    field: 'general'
  },
  'invalid_grant': {
    userMessage: 'Invalid or expired reset token. Please request a new one.',
    field: 'general'
  },
  'validation_failed': {
    userMessage: 'Please check your information and try again.',
    field: 'general'
  },
  'over_email_send_rate_limit': {
    userMessage: 'Too many email requests. Please wait a few minutes.',
    field: 'general'
  }
};

/**
 * Create a standardized auth error object
 */
export function createAuthError(
  error: Error | AuthError | unknown,
  context?: AuthErrorDetails['context']
): AuthErrorDetails {
  // Handle different error types
  let code = 'unknown_error';
  let message = 'An unexpected error occurred';
  
  if (error instanceof Error) {
    message = error.message;
    // Extract error code from message if present
    if (message.includes('User already registered')) {
      code = 'user_already_exists';
    } else if (message.includes('Invalid login')) {
      code = 'invalid_credentials';
    } else if (message.includes('Email not confirmed')) {
      code = 'email_not_confirmed';
    } else if (message.includes('Password should be')) {
      code = 'weak_password';
    }
  }
  
  if (typeof error === 'object' && error !== null && 'code' in error) {
    code = String(error.code);
  }
  
  // Get mapped error or use defaults
  const mapped = ERROR_MAPPINGS[code] || {};
  
  return {
    code,
    message,
    context,
    field: mapped.field || 'general',
    userMessage: mapped.userMessage || 'An error occurred. Please try again.'
  };
}

/**
 * Get display message for an auth error
 */
export function getDisplayMessage(error: AuthErrorDetails | string | null): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  return error.userMessage;
}

/**
 * Get the field associated with an error
 */
export function getErrorField(error: AuthErrorDetails | null): AuthErrorDetails['field'] {
  return error?.field || 'general';
}

/**
 * Check if error is related to a specific field
 */
export function isFieldError(
  error: AuthErrorDetails | null,
  field: AuthErrorDetails['field']
): boolean {
  return error?.field === field;
}

/**
 * Format error for form display
 */
export function formatFormError(error: AuthErrorDetails | null): {
  title: string;
  description: string;
  variant: 'error' | 'warning';
} {
  if (!error) {
    return {
      title: '',
      description: '',
      variant: 'error'
    };
  }
  
  // Special handling for certain error types
  if (error.code === 'email_not_confirmed') {
    return {
      title: 'Email Verification Required',
      description: error.userMessage,
      variant: 'warning'
    };
  }
  
  if (error.code === 'rate_limit_exceeded') {
    return {
      title: 'Too Many Attempts',
      description: error.userMessage,
      variant: 'warning'
    };
  }
  
  return {
    title: 'Authentication Failed',
    description: error.userMessage,
    variant: 'error'
  };
}

/**
 * Create validation error for form fields
 */
export function createValidationError(
  field: AuthErrorDetails['field'],
  message: string
): AuthErrorDetails {
  return {
    code: 'validation_error',
    message,
    field,
    userMessage: message,
    context: undefined
  };
}