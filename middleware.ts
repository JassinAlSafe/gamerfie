import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // This updates the session if it exists
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      // Authenticate the user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error authenticating user:", error);
        // Handle the error appropriately, e.g., redirect to login
        return NextResponse.redirect(new URL("/signin", req.url));
      }

      if (user) {
        console.log("Authenticated user:", user.id);
        // You can add the user to the request here if needed
        // req.user = user
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
