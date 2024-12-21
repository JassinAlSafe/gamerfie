import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    // Handle Supabase auth
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session: supabaseSession } } = await supabase.auth.getSession();

    // Check NextAuth session
    const nextAuthToken = await getToken({ req });

    // Add auth info to headers for API routes
    if (req.nextUrl.pathname.startsWith("/api/")) {
      if (supabaseSession) {
        res.headers.set("x-user-id", supabaseSession.user.id);
      }
      if (nextAuthToken) {
        res.headers.set("x-session-token", nextAuthToken.sub || "");
      }

      // Add CORS headers
      res.headers.append("Access-Control-Allow-Credentials", "true");
      res.headers.append("Access-Control-Allow-Origin", "*");
      res.headers.append(
        "Access-Control-Allow-Methods",
        "GET,DELETE,PATCH,POST,PUT"
      );
      res.headers.append(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
      );
    }

    return res;
  } catch (e) {
    console.error("Middleware error:", e);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

