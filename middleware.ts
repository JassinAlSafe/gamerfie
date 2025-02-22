import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// These routes require authentication
const protectedRoutes = ['/profile', '/settings'];
// These routes are only for non-authenticated users
const authRoutes = ['/signin', '/signup'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // Skip auth check for auth callback route
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res;
  }

  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // If user is not signed in and trying to access a protected route
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/signin', req.url);
    // Store the original URL to redirect back after login
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and trying to access auth routes (signin/signup)
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

