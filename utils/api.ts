/**
 * Centralized API utilities and error handling
 * Based on the documented best practices from instructions.md
 */

interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export class APIError extends Error {
  constructor(
    message: string, 
    public status: number, 
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    // Handle non-JSON responses
    data = { error: "Invalid response format" };
  }

  if (!response.ok) {
    throw new APIError(
      data.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      data.code,
      data.details
    );
  }

  return data;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
}

export function buildPaginatedQuery(
  baseParams: Record<string, any>,
  pagination?: PaginationParams
) {
  return buildQueryString({
    ...baseParams,
    page: pagination?.page,
    limit: pagination?.limit,
    cursor: pagination?.cursor,
  });
}

/**
 * Retry function with exponential backoff
 */
export async function fetchWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: APIError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchAPI<T>(endpoint, options);
    } catch (error) {
      lastError = error instanceof APIError ? error : new APIError(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );

      // Don't retry client errors (4xx)
      if (lastError.status >= 400 && lastError.status < 500) {
        throw lastError;
      }

      // Wait before retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Handle common API error scenarios
 */
export function handleAPIError(error: unknown): {
  message: string;
  isRetryable: boolean;
  shouldRedirect?: string;
} {
  if (error instanceof APIError) {
    switch (error.status) {
      case 401:
        return {
          message: "Please sign in to continue",
          isRetryable: false,
          shouldRedirect: "/signin"
        };
      case 403:
        return {
          message: "You don't have permission to perform this action",
          isRetryable: false
        };
      case 404:
        return {
          message: "The requested resource was not found",
          isRetryable: false
        };
      case 429:
        return {
          message: "Too many requests. Please try again later",
          isRetryable: true
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: "Server error. Please try again later",
          isRetryable: true
        };
      default:
        return {
          message: error.message || "An unexpected error occurred",
          isRetryable: error.status >= 500
        };
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: "Network error. Please check your connection",
      isRetryable: true
    };
  }

  return {
    message: error instanceof Error ? error.message : "An unexpected error occurred",
    isRetryable: false
  };
}

/**
 * Generic API hook helper for React Query
 */
export function createAPIHook<TData, TVariables = void>(
  endpoint: string | ((variables: TVariables) => string),
  options?: RequestInit
) {
  return {
    queryFn: async (variables?: TVariables): Promise<TData> => {
      const url = typeof endpoint === 'function' ? endpoint(variables!) : endpoint;
      return fetchAPI<TData>(url, options);
    },
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const url = typeof endpoint === 'function' ? endpoint(variables) : endpoint;
      return fetchAPI<TData>(url, {
        method: 'POST',
        body: JSON.stringify(variables),
        ...options,
      });
    }
  };
}