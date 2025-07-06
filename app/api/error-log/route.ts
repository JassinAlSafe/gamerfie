import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware, RateLimitPresets } from '@/utils/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(RateLimitPresets.logging)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const errorData = await request.json();
    
    // In production, you would send this to your logging service
    // For now, we'll log to console and potentially store in a database
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      ...errorData,
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR LOG]', logEntry);
    }
    
    // TODO: In production, send to your logging service
    // Examples:
    // - Store in database
    // - Send to external logging service (Logtail, Datadog, etc.)
    // - Send to email alerts for critical errors
    
    // For now, we'll just acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Error logged successfully' 
    });
    
  } catch (error) {
    // Don't let error logging fail the application
    console.error('Failed to log error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log error' },
      { status: 500 }
    );
  }
}