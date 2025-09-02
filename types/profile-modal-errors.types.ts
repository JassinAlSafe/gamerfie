// Enhanced error types for ProfileCardModal
export type ProfileModalErrorType = 
  | 'NETWORK_ERROR'
  | 'PROFILE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface ProfileModalError {
  type: ProfileModalErrorType;
  message: string;
  code?: string;
  retry?: boolean;
  retryAfter?: number; // seconds
  details?: Record<string, unknown>;
}

export interface ProfileModalLoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number; // 0-100
}

export interface ProfileModalErrorState {
  error: ProfileModalError | null;
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
}

// Error factory functions
export const createProfileModalError = {
  networkError: (message = 'Network connection failed'): ProfileModalError => ({
    type: 'NETWORK_ERROR',
    message,
    retry: true,
    code: 'NETWORK_ERROR',
  }),

  profileNotFound: (userId: string): ProfileModalError => ({
    type: 'PROFILE_NOT_FOUND',
    message: 'This profile could not be found',
    retry: false,
    code: 'PROFILE_NOT_FOUND',
    details: { userId },
  }),

  permissionDenied: (): ProfileModalError => ({
    type: 'PERMISSION_DENIED',
    message: 'You do not have permission to view this profile',
    retry: false,
    code: 'PERMISSION_DENIED',
  }),

  rateLimited: (retryAfter = 60): ProfileModalError => ({
    type: 'RATE_LIMITED',
    message: 'Too many requests. Please wait before trying again',
    retry: true,
    retryAfter,
    code: 'RATE_LIMITED',
  }),

  validationError: (message: string): ProfileModalError => ({
    type: 'VALIDATION_ERROR',
    message,
    retry: false,
    code: 'VALIDATION_ERROR',
  }),

  unknownError: (message = 'An unexpected error occurred'): ProfileModalError => ({
    type: 'UNKNOWN_ERROR',
    message,
    retry: true,
    code: 'UNKNOWN_ERROR',
  }),
};

// Helper function to determine if an error should allow retry
export const shouldAllowRetry = (error: ProfileModalError): boolean => {
  return error.retry === true && error.type !== 'PROFILE_NOT_FOUND' && error.type !== 'PERMISSION_DENIED';
};

// Helper function to get user-friendly error messages
export const getErrorMessage = (error: ProfileModalError): string => {
  const userFriendlyMessages: Record<ProfileModalErrorType, string> = {
    NETWORK_ERROR: 'Connection issue. Please check your internet and try again.',
    PROFILE_NOT_FOUND: 'This profile is not available or may have been removed.',
    PERMISSION_DENIED: 'You don\'t have access to view this profile.',
    RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',
    VALIDATION_ERROR: 'Invalid profile information provided.',
    UNKNOWN_ERROR: 'Something went wrong. Please try again later.',
  };

  return userFriendlyMessages[error.type] || error.message;
};