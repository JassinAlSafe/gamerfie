/**
 * Session validation utilities for authentication
 * Helps ensure consistent session validation across client and server
 */

import type { Session, User } from '@supabase/supabase-js';

export interface SessionValidationResult {
  isValid: boolean;
  user: User | null;
  reason?: string;
}

/**
 * Validate a Supabase session
 */
export function validateSession(session: Session | null): SessionValidationResult {
  if (!session) {
    return {
      isValid: false,
      user: null,
      reason: 'No session provided'
    };
  }

  if (!session.user) {
    return {
      isValid: false,
      user: null,
      reason: 'Session has no user'
    };
  }

  if (!session.access_token) {
    return {
      isValid: false,
      user: null,
      reason: 'Session has no access token'
    };
  }

  // Check if session is expired
  const now = Date.now() / 1000;
  if (session.expires_at && session.expires_at < now) {
    return {
      isValid: false,
      user: null,
      reason: 'Session is expired'
    };
  }

  // Check if user has required fields
  if (!session.user.id) {
    return {
      isValid: false,
      user: null,
      reason: 'User has no ID'
    };
  }

  return {
    isValid: true,
    user: session.user
  };
}

/**
 * Check if a session needs to be refreshed soon
 */
export function sessionNeedsRefresh(session: Session | null): boolean {
  if (!session || !session.expires_at) {
    return false;
  }

  const now = Date.now() / 1000;
  const refreshThreshold = 5 * 60; // 5 minutes before expiry
  
  return (session.expires_at - now) < refreshThreshold;
}

/**
 * Get safe user data for logging/debugging
 */
export function getSafeUserData(user: User | null): Record<string, any> {
  if (!user) return { user: null };
  
  return {
    id: user.id,
    email: user.email,
    email_confirmed_at: user.email_confirmed_at,
    last_sign_in_at: user.last_sign_in_at,
    created_at: user.created_at,
    role: user.role,
    app_metadata: user.app_metadata,
    // Note: Don't log user_metadata as it may contain sensitive info
    has_user_metadata: !!user.user_metadata
  };
}