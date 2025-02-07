export class GameServiceError extends Error {
    constructor(message: string, public _originalError?: unknown) {
      super(message);
      this.name = 'GameServiceError';
    }
  }

export class APIError extends Error {
  constructor(
    message: string,
    public _statusCode: number,
    public _originalError?: unknown
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
  constructor(message: string, public _field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export type ErrorResponse = {
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
};