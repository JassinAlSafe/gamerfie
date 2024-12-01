import type { TokenResponse } from '../types/auth';
import { getCookie, checkTokenValidity } from '../utils/cookieUtils';

export async function fetchNewToken(): Promise<TokenResponse> {
  const isValid = checkTokenValidity();
  if (isValid) {
    const token = getCookie('accessToken');
    if (token) {
      return {
        accessToken: token,
        expiresAt: getCookie('tokenExpiry') || ''
      };
    }
  }

  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.accessToken) {
    throw new Error('Invalid response from server');
  }

  return data;
}