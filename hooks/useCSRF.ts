/**
 * CSRF Token Management Hook
 * Provides secure CSRF token handling for forms
 */

import { useState, useEffect, useCallback } from 'react';

interface CSRFState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface CSRFResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export function useCSRF() {
  const [state, setState] = useState<CSRFState>({
    token: null,
    isLoading: false,
    error: null
  });

  /**
   * Fetch a new CSRF token
   */
  const fetchToken = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/csrf', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data: CSRFResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch CSRF token');
      }
      
      setState({
        token: data.token || null,
        isLoading: false,
        error: null
      });
      
      return data.token || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch CSRF token';
      setState({
        token: null,
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }, []);

  /**
   * Get token with automatic refresh if needed
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    if (state.token && !state.error) {
      return state.token;
    }
    
    return fetchToken();
  }, [state.token, state.error, fetchToken]);

  /**
   * Clear the current token
   */
  const clearToken = useCallback(() => {
    setState({
      token: null,
      isLoading: false,
      error: null
    });
  }, []);

  /**
   * Get headers for authenticated requests
   */
  const getCSRFHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No CSRF token available');
    }
    
    return {
      'X-CSRF-Token': token,
      'Content-Type': 'application/json'
    };
  }, [getToken]);

  /**
   * Auto-fetch token on mount
   */
  useEffect(() => {
    fetchToken().catch(error => {
      console.warn('Failed to auto-fetch CSRF token:', error);
    });
  }, [fetchToken]);

  return {
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    fetchToken,
    getToken,
    clearToken,
    getCSRFHeaders
  };
}

/**
 * Simple hook that just returns the current CSRF token
 */
export function useCSRFToken(): string | null {
  const { token } = useCSRF();
  return token;
}