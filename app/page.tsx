import { createClient } from "@/utils/supabase/server";
import { HomePageWrapper } from "@/components/home/HomePageWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_API_BASE || 
    (process.env.NODE_ENV === "production" ? "https://gamersvaultapp.com" : "http://localhost:3000")
  ),
  title: "Game Vault - Ultimate Video Game Tracking Platform",
  description: "Track your video game progress, discover new games, and connect with gamers worldwide. The ultimate gaming community platform for achievement tracking, game reviews, and gaming statistics.",
};


export default async function HomePage() {
  try {
    // Check if we're in build time or if required env vars are missing
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.warn("Supabase environment variables not available during build");
      return <HomePageWrapper serverUser={null} />;
    }

    const supabase = await createClient();

    // Use getUser() instead of getSession() for security
    // getUser() authenticates the data by contacting the Supabase Auth server
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Handle auth errors gracefully during build
    if (authError) {
      console.warn("Auth error during build:", authError.message);
      return <HomePageWrapper serverUser={null} />;
    }

    // Pass server user to client wrapper, which will override with client state if needed
    return <HomePageWrapper serverUser={user} />;
  } catch (error) {
    // Catch any build-time errors and fall back to unauthenticated view
    console.warn("Build-time error in HomePage:", error);
    return <HomePageWrapper serverUser={null} />;
  }
}
