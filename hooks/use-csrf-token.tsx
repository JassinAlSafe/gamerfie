import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * Hook for managing CSRF tokens in React components
 */

interface CsrfTokenState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface CsrfTokenHook extends CsrfTokenState {
  refreshToken: () => Promise<void>;
  getHeaders: () => Record<string, string>;
}

/**
 * Custom hook for CSRF token management
 */
export function useCsrfToken(): CsrfTokenHook {
  const [state, setState] = useState<CsrfTokenState>({
    token: null,
    isLoading: true,
    error: null
  });

  const fetchToken = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/csrf', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.csrfToken) {
        throw new Error('Invalid CSRF token response');
      }

      setState({
        token: data.csrfToken,
        isLoading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch CSRF token';
      setState({
        token: null,
        isLoading: false,
        error: errorMessage
      });
      console.error('CSRF token fetch error:', error);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    await fetchToken();
  }, [fetchToken]);

  const getHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (state.token) {
      headers['x-csrf-token'] = state.token;
    }

    return headers;
  }, [state.token]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return {
    ...state,
    refreshToken,
    getHeaders
  };
}

/**
 * Higher-order component for wrapping components that need CSRF protection
 */
export function withCsrfProtection<P extends object>(
  WrappedComponent: React.ComponentType<P & { csrfToken: string | null }>
) {
  return function CsrfProtectedComponent(props: P) {
    const { token } = useCsrfToken();
    
    return <WrappedComponent {...props} csrfToken={token} />;
  };
}

/**
 * Context for CSRF token sharing across components
 */

interface CsrfTokenContextValue extends CsrfTokenHook {}

const CsrfTokenContext = createContext<CsrfTokenContextValue | undefined>(undefined);

/**
 * Provider component for CSRF token context
 */
export function CsrfTokenProvider({ children }: { children: React.ReactNode }) {
  const csrfToken = useCsrfToken();

  return (
    <CsrfTokenContext.Provider value={csrfToken}>
      {children}
    </CsrfTokenContext.Provider>
  );
}

/**
 * Hook to use CSRF token from context
 */
export function useCsrfTokenContext(): CsrfTokenContextValue {
  const context = useContext(CsrfTokenContext);
  
  if (context === undefined) {
    throw new Error('useCsrfTokenContext must be used within a CsrfTokenProvider');
  }
  
  return context;
}

/**
 * Utility function to make CSRF-protected API calls
 */
export async function makeCsrfProtectedRequest(
  url: string,
  options: RequestInit & { csrfToken?: string } = {}
): Promise<Response> {
  const { csrfToken, headers = {}, ...restOptions } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers as Record<string, string>
  };

  if (csrfToken) {
    requestHeaders['x-csrf-token'] = csrfToken;
  }

  return fetch(url, {
    ...restOptions,
    headers: requestHeaders,
    credentials: 'include'
  });
}

/**
 * Hook for making CSRF-protected API calls
 */
export function useCsrfProtectedFetch() {
  const { token, getHeaders } = useCsrfToken();

  const fetchWithCsrf = useCallback(
    async (url: string, options: RequestInit = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...getHeaders(),
          ...options.headers
        },
        credentials: 'include'
      });
    },
    [getHeaders]
  );

  return {
    fetchWithCsrf,
    isReady: token !== null
  };
}