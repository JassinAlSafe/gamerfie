/**
 * OAuth Security Utilities
 * Provides secure state management and CSRF protection for OAuth flows
 */

import { createHash, randomBytes } from 'crypto';

export interface OAuthState {
  state: string;
  codeVerifier: string;
  timestamp: number;
  nonce: string;
}

/**
 * Generate a secure OAuth state with PKCE support
 */
export function generateOAuthState(): OAuthState {
  const state = randomBytes(32).toString('base64url');
  const codeVerifier = randomBytes(32).toString('base64url');
  const nonce = randomBytes(16).toString('base64url');
  const timestamp = Date.now();

  return {
    state,
    codeVerifier,
    timestamp,
    nonce
  };
}

/**
 * Generate code challenge for PKCE
 */
export function generateCodeChallenge(codeVerifier: string): string {
  return createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
}

/**
 * Store OAuth state securely in sessionStorage
 */
export function storeOAuthState(oauthState: OAuthState): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    sessionStorage.setItem('oauth_state', JSON.stringify(oauthState));
    return true;
  } catch (error) {
    console.error('Failed to store OAuth state:', error);
    return false;
  }
}

/**
 * Retrieve and validate OAuth state from sessionStorage
 */
export function getAndValidateOAuthState(receivedState: string): OAuthState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedStateStr = sessionStorage.getItem('oauth_state');
    if (!storedStateStr) return null;
    
    const storedState: OAuthState = JSON.parse(storedStateStr);
    
    // Validate state matches
    if (storedState.state !== receivedState) {
      console.error('OAuth state mismatch - possible CSRF attack');
      return null;
    }
    
    // Check if state is expired (30 minutes max)
    const maxAge = 30 * 60 * 1000; // 30 minutes
    if (Date.now() - storedState.timestamp > maxAge) {
      console.error('OAuth state expired');
      return null;
    }
    
    // Clear the state after validation
    sessionStorage.removeItem('oauth_state');
    
    return storedState;
  } catch (error) {
    console.error('Failed to validate OAuth state:', error);
    return null;
  }
}

/**
 * Clear OAuth state from storage
 */
export function clearOAuthState(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('oauth_state');
  }
}

/**
 * Generate secure redirect URL for OAuth
 */
export function generateSecureRedirectURL(baseUrl: string, additionalParams?: Record<string, string>): string {
  const url = new URL('/auth/callback', baseUrl);
  
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}