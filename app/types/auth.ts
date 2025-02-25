export interface TokenError {
  message: string;
  code?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: AuthError;
  data?: any;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
}

export const isSupabaseError = (error: unknown): error is { message: string } => {
  return typeof error === 'object' && error !== null && 'message' in error;
}; 