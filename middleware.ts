import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isBefore } from "date-fns";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  console.log("Middleware triggered for URL:", req.url);

 

  // Create a response object that we can modify
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // List of routes that require authentication
  const protectedRoutes = ["/profile", "/save-game", "/my-collections"];

  if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    // If no session and trying to access a protected route, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  //Handle IGBD API
  const accessToken = req.cookies.get("accessToken")?.value;
  const tokenExpiry = req.cookies.get("tokenExpiry")?.value;

  console.log("Access Token from cookies:", accessToken);
  console.log("Token Expiry from cookies:", tokenExpiry);

  // If token is valid, proceed
  if (
    accessToken &&
    tokenExpiry &&
    !isBefore(new Date(tokenExpiry), new Date())
  ) {
    console.log("Token is valid, proceeding...");
    return NextResponse.next(); // Token is valid, proceed
  }

  // If token is missing or expired, fetch a new one
  console.log("Token missing or expired, fetching a new one...");

  const tokenResponse = await fetch(`${req.nextUrl.origin}/api/auth`, {
    method: "POST",
  });

  if (!tokenResponse.ok) {
    console.error("Error fetching token:", tokenResponse.statusText);
    return new Response("Failed to fetch token from /api/auth", {
      status: 500,
    });
  }

  const tokenData = await tokenResponse.json();

  const newToken = tokenData.accessToken;
  const newTokenExpiry = tokenData.tokenExpiry;

  if (!newToken) {
    console.error("No token returned from /api/auth");
    return new Response("Failed to fetch token", { status: 500 });
  }

  // Log the fetched token
  console.log("New token fetched:", newToken);

  // Set the new token in cookies
  const response = NextResponse.next();
  response.cookies.set("accessToken", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
  });
  response.cookies.set("tokenExpiry", newTokenExpiry, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};