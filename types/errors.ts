// Standardized error classes
export class GameServiceError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'GameServiceError';
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Standard error response type
export interface ErrorResponse {
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp?: string;
}

// Standardized error interfaces
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

export interface NetworkError extends AppError {
  status: number;
  url: string;
}

export interface AuthError extends AppError {
  type: 'unauthorized' | 'forbidden' | 'token_expired' | 'invalid_credentials';
}

// Error factory functions
export const createAppError = (message: string, code?: string, details?: Record<string, unknown>): AppError => ({
  message,
  code,
  details,
  timestamp: new Date().toISOString()
});

export const createNetworkError = (message: string, status: number, url: string): NetworkError => ({
  ...createAppError(message, 'NETWORK_ERROR'),
  status,
  url
});

export const createAuthError = (message: string, type: AuthError['type']): AuthError => ({
  ...createAppError(message, 'AUTH_ERROR'),
  type
});