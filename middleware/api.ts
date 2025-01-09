import rateLimit from 'express-rate-limit';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

export async function apiMiddleware(req: NextRequest) {
  // Rate limiting
  try {
    await limiter(req);
  } catch (error) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429 }
    );
  }

  // Add common headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
} 