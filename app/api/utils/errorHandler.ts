export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const errorHandler = (error: unknown) => {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return {
      error: error.message,
      details: error.details,
      statusCode: error.statusCode
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500
    };
  }

  return {
    error: 'An unexpected error occurred',
    statusCode: 500
  };
};

// Common error responses
export const errors = {
  unauthorized: () => new APIError('Unauthorized', 401),
  forbidden: () => new APIError('Forbidden', 403),
  notFound: (resource: string) => new APIError(`${resource} not found`, 404),
  badRequest: (message: string, details?: any) => new APIError(message, 400, details),
  conflict: (message: string) => new APIError(message, 409),
  serverError: (message: string = 'Internal server error') => new APIError(message, 500)
}; 