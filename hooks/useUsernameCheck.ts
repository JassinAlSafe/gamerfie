import { useCallback, useRef } from 'react';

interface UsernameCheckResponse {
  available: boolean;
  username: string;
  reason?: string;
  error?: string;
}

export const useUsernameCheck = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkUsername = useCallback(async (username: string): Promise<UsernameCheckResponse> => {
    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to check username');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Request was aborted, return a neutral result
          throw new Error('Request aborted');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    } finally {
      // Clear the abort controller reference if it matches current one
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  // Cleanup function to abort ongoing requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    checkUsername,
    cleanup
  };
};