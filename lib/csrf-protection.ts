import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

/**
 * CSRF Protection utilities for API routes
 * Provides token generation, validation, and middleware functions
 */

const CSRF_SECRET_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

interface CsrfTokenPair {
  token: string;
  secret: string;
}

/**
 * Generate a CSRF token pair (token and secret)
 */
export function generateCsrfToken(): CsrfTokenPair {
  const secret = randomBytes(CSRF_SECRET_LENGTH).toString('hex');
  const token = createHash('sha256')
    .update(secret)
    .update(process.env.NEXTAUTH_SECRET || process.env.SUPABASE_JWT_SECRET || 'gamerfie-csrf-fallback-secret')
    .digest('hex');
    
  return { token, secret };
}

/**
 * Verify a CSRF token against its secret
 */
export function verifyCsrfToken(token: string, secret: string): boolean {
  if (!token || !secret) {
    return false;
  }

  try {
    const expectedToken = createHash('sha256')
      .update(secret)
      .update(process.env.NEXTAUTH_SECRET || process.env.SUPABASE_JWT_SECRET || 'gamerfie-csrf-fallback-secret')
      .digest('hex');
      
    return token === expectedToken;
  } catch {
    return false;
  }
}

/**
 * Extract CSRF token from request headers or body
 */
export function extractCsrfToken(request: NextRequest): string | null {
  // Try header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Try URL search params for GET requests
  const urlToken = request.nextUrl.searchParams.get('csrf-token');
  if (urlToken) {
    return urlToken;
  }

  return null;
}

/**
 * Extract CSRF secret from cookies
 */
export function extractCsrfSecret(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Set CSRF token in response cookies
 */
export function setCsrfCookie(response: NextResponse, secret: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

/**
 * Validate CSRF token for protected routes
 */
export function validateCsrfToken(request: NextRequest): {
  isValid: boolean;
  error?: string;
} {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { isValid: true };
  }

  const token = extractCsrfToken(request);
  const secret = extractCsrfSecret(request);

  if (!token) {
    return {
      isValid: false,
      error: 'CSRF token missing from request'
    };
  }

  if (!secret) {
    return {
      isValid: false,
      error: 'CSRF secret missing from cookies'
    };
  }

  if (!verifyCsrfToken(token, secret)) {
    return {
      isValid: false,
      error: 'Invalid CSRF token'
    };
  }

  return { isValid: true };
}

/**
 * CSRF protection middleware for API routes
 */
export function withCsrfProtection<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const validation = validateCsrfToken(request);
    
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.error || 'CSRF validation failed',
          code: 'CSRF_INVALID'
        },
        { status: 403 }
      );
    }

    return handler(request, ...args);
  };
}

/**
 * Generate a new CSRF token and set it in response
 * Use this for GET routes that need to provide a token to the client
 */
export function generateAndSetCsrfToken(response: NextResponse): string {
  const { token, secret } = generateCsrfToken();
  setCsrfCookie(response, secret);
  return token;
}

/**
 * API endpoint to get CSRF token
 * This can be called by the frontend to obtain a CSRF token
 */
export async function getCsrfTokenHandler(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  const token = generateAndSetCsrfToken(response);
  
  return NextResponse.json(
    {
      success: true,
      csrfToken: token
    },
    { 
      status: 200,
      headers: response.headers
    }
  );
}

/**
 * Type for CSRF-protected API handler
 */
export type CsrfProtectedHandler<T extends any[] = []> = (
  request: NextRequest,
  ...args: T
) => Promise<NextResponse>;

/**
 * Security headers for enhanced protection
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.supabase.co; " +
    "frame-ancestors 'none';"
  );

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}