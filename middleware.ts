import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Handle Supabase auth
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();

  // Add CORS headers for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle IGDB API routes specifically
    if (req.nextUrl.pathname.startsWith('/api/games')) {
      // Verify IGDB environment variables
      if (!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'IGDB credentials not configured' 
          }),
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Add cache control headers
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Apply to all routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

