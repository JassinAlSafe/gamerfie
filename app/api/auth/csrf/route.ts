import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/auth-security';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * CSRF Token API Endpoint
 * GET /api/auth/csrf - Returns a new CSRF token
 */
export async function GET(request: NextRequest) {
  try {
    const token = await generateCSRFToken(request);
    
    return NextResponse.json({ 
      success: true, 
      csrfToken: token 
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate CSRF token' 
      },
      { status: 500 }
    );
  }
}