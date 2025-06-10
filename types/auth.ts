export interface TokenError {
  message: string;
  code?: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresAt: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: AuthError;
}

export function isSupabaseError(error: any): error is { message: string } {
  return error && typeof error.message === 'string';
} 