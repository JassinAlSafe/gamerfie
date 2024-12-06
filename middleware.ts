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
        console.log("Session refreshed for user:", refreshedSession.user.id);
      }

      // If there's a session and user tries to access signin, redirect to profile
      if (req.nextUrl.pathname.startsWith('/signin')) {
        return NextResponse.redirect(new URL('/profile', req.url));
      }
    } else if (!req.nextUrl.pathname.startsWith('/signin')) {
      // If no session and trying to access any protected route, redirect to signin
      return NextResponse.redirect(new URL('/signin', req.url));
    }

    return res;
  } catch (e) {
    console.error("Error in middleware:", e);
    return NextResponse.redirect(new URL('/error', req.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};

