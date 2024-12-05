import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    if (session) {
      // Refresh the session if it exists
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("Error refreshing session:", refreshError);
        return NextResponse.redirect(new URL("/signin", req.url));
      }

      if (refreshedSession) {
        // Session refreshed successfully
        console.log("Session refreshed for user:", refreshedSession.user.id);
      }
    }

    // If the user is not authenticated and trying to access the profile page, redirect to sign in
    if (!session && req.nextUrl.pathname === "/profile") {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    return res;
  } catch (e) {
    console.error("Error in middleware:", e);
    // Handle any errors that occur during the middleware execution
    return NextResponse.redirect(new URL("/error", req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

