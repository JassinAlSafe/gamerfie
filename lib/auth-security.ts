/**
 * Authentication Security Utilities
 * CSRF protection, rate limiting, and secure session management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * CSRF Token Management
 */
class CSRFTokenManager {
  private static tokens = new Map<string, { token: string; expires: number }>();
  private static readonly TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes

  static generate(sessionId: string): string {
    const token = crypto.randomUUID();
    const expires = Date.now() + this.TOKEN_LIFETIME;
    
    this.tokens.set(sessionId, { token, expires });
    this.cleanup();
    
    return token;
  }

  static validate(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) return false;
    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }

  private static cleanup(): void {
    const now = Date.now();
    for (const [id, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(id);
      }
    }
  }
}

/**
 * Rate limiting for auth endpoints
 */
class RateLimiter {
  private static attempts = new Map<string, { count: number; resetAt: number }>();
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_ATTEMPTS = 5;

  static check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetAt) {
      // Start new window
      this.attempts.set(identifier, {
        count: 1,
        resetAt: now + this.WINDOW_MS
      });
      
      return {
        allowed: true,
        remaining: this.MAX_ATTEMPTS - 1,
        resetAt: now + this.WINDOW_MS
      };
    }

    if (record.count >= this.MAX_ATTEMPTS) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt
      };
    }

    // Increment attempts
    record.count++;
    
    return {
      allowed: true,
      remaining: this.MAX_ATTEMPTS - record.count,
      resetAt: record.resetAt
    };
  }

  static reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Secure session validation
 */
export async function validateSession(request: NextRequest): Promise<{
  valid: boolean;
  user?: { id: string; email?: string };
  reason?: string;
}> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Read-only in validation
          }
        }
      }
    );

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return { valid: false, reason: 'No valid session' };
    }

    // Additional validation checks
    const now = Math.floor(Date.now() / 1000);
    const exp = session.expires_at;

    if (exp && exp < now) {
      return { valid: false, reason: 'Session expired' };
    }

    // Check for suspicious activity
    const userAgent = request.headers.get('user-agent');
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    
    // You could add more sophisticated checks here
    // For example, checking if IP/user agent suddenly changed

    return {
      valid: true,
      user: {
        id: session.user.id,
        email: session.user.email
      }
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, reason: 'Validation error' };
  }
}

/**
 * Apply rate limiting to auth endpoints
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    // Get identifier (IP or session ID)
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const { allowed, remaining, resetAt } = RateLimiter.check(ip);
    
    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toString(),
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }
    
    // Process request
    const response = await handler(req);
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '5');
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetAt.toString());
    
    return response;
  };
}

/**
 * Generate secure CSRF token for forms
 */
export async function generateCSRFToken(request: NextRequest): Promise<string> {
  const sessionId = request.cookies.get('session-id')?.value || crypto.randomUUID();
  return CSRFTokenManager.generate(sessionId);
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFToken(
  request: NextRequest,
  token: string
): Promise<boolean> {
  const sessionId = request.cookies.get('session-id')?.value;
  
  if (!sessionId) return false;
  
  return CSRFTokenManager.validate(sessionId, token);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  // Basic sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Hash sensitive data for logging
 */
export function hashForLogging(data: string): string {
  // Simple hash for logging purposes (not cryptographic)
  return data.substring(0, 3) + '***' + data.substring(data.length - 3);
}