import { NextRequest } from 'next/server';
import { getCsrfTokenHandler, addSecurityHeaders } from '@/lib/csrf-protection';

/**
 * CSRF Token API Endpoint
 * GET /api/auth/csrf - Returns a new CSRF token
 */

export async function GET(request: NextRequest) {
  try {
    const response = await getCsrfTokenHandler();
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Failed to generate CSRF token' 
      },
      { status: 500 }
    );
  }
}