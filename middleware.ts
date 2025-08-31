import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Content Security Policy configuration
 * This helps prevent XSS attacks by controlling which resources can be loaded
 */
function getCSPHeader() {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.googletagmanager.com https://analytics.google.com https://ssl.google-analytics.com https://va.vercel-scripts.com https://vercel.live`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http: https://*.googleusercontent.com https://googleusercontent.com https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com https://images.igdb.com",
    "media-src 'self' https://www.youtube.com https://youtube.com",
    "frame-src 'self' https://www.youtube.com https://youtube.com",
    "connect-src 'self' https://api.rawg.io https://*.supabase.co wss://*.supabase.co https://analytics.google.com https://api.twitch.tv https://id.twitch.tv https://va.vercel-scripts.com https://vitals.vercel-insights.com https://vercel.live https://api.stripe.com https://images.igdb.com https://*.googleusercontent.com https://googleusercontent.com https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com http://localhost:* ws://localhost:*",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];
  
  return csp.join('; ');
}

/**
 * Generate a random nonce for CSP
 */
function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
}

export async function middleware(request: NextRequest) {
  // Handle Supabase auth first
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if this is a logout route
  const isLogoutRoute = request.nextUrl.pathname.includes('/logout') || 
                        request.nextUrl.pathname.includes('/signout') ||
                        request.nextUrl.pathname.includes('/api/auth/logout');
  
  // Check if this is an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  if (!isLogoutRoute) {
    try {
      // IMPORTANT: Use getUser() not getSession() for security
      // getUser() sends a request to Supabase Auth to revalidate the token
      // This also refreshes the session if needed
      const { data: { user }, error } = await supabase.auth.getUser();
      
      console.log('🔍 Middleware auth check:', {
        path: request.nextUrl.pathname,
        hasUser: !!user,
        userId: user?.id,
        isAdminRoute,
        error: error?.message,
        cookies: request.cookies.getAll().map(c => c.name).filter(n => n.includes('sb-'))
      });
      
      // If we have an error getting user but should have auth cookies, log warning
      if (error && request.cookies.getAll().some(c => c.name.includes('sb-'))) {
        console.log('⚠️ Auth error but cookies present:', error.message);
      }
      
      // ADMIN ROUTE PROTECTION - Server-side validation
      if (isAdminRoute) {
        // No user? Redirect to home
        if (!user) {
          console.log('🚫 Admin route access denied - no user');
          return NextResponse.redirect(new URL('/', request.url));
        }
        
        // Check admin role in database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileError || profile?.role !== 'admin') {
          console.log('🚫 Admin route access denied - not admin role', {
            userId: user.id,
            role: profile?.role,
            error: profileError?.message
          });
          return NextResponse.redirect(new URL('/', request.url));
        }
        
        console.log('✅ Admin access granted for user:', user.id);
      }
    } catch (error) {
      console.error('🚨 Middleware auth check failed:', error);
      // On error, deny access to admin routes
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } else {
    console.log('🚪 Skipping auth check for logout route:', request.nextUrl.pathname);
  }

  // Generate nonce for CSP (if needed in future)
  const nonce = generateNonce();

  // Security Headers
  const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': getCSPHeader(),
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // XSS Protection (legacy but still useful)
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Prevent Adobe Flash and PDF plugins from loading
    'X-Permitted-Cross-Domain-Policies': 'none',
    
    // HSTS (HTTP Strict Transport Security) - only in production with HTTPS
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),
    
    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
    ].join(', '),
  };

  // Apply security headers to the supabase response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value);
  });

  // Special handling for service worker - allow it to fetch images and data
  if (request.nextUrl.pathname === '/sw.js' || request.nextUrl.pathname.startsWith('/sw')) {
    supabaseResponse.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval'; " +
      "connect-src 'self' https://*.googleusercontent.com https://googleusercontent.com https://images.igdb.com https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com; " +
      "img-src 'self' data: blob: https: http: https://*.googleusercontent.com https://googleusercontent.com https://images.igdb.com https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com; " +
      "font-src 'self' data:; " +
      "style-src 'self' 'unsafe-inline'"
    );
  }

  // Set nonce for use in components (optional)
  supabaseResponse.headers.set('X-Nonce', nonce);

  return supabaseResponse;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - sw.js (service worker)
     * 
     * Note: We INCLUDE api routes now to handle auth properly
     */
    '/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};