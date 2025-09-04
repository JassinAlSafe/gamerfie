import { createClient } from "@/utils/supabase/server";
import { HomePageWrapper } from "@/components/home/HomePageWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_API_BASE || 
    (process.env.NODE_ENV === "production" ? "https://gamersvaultapp.com" : "http://localhost:3000")
  ),
  title: "Best Video Game Tracker 2025 - Game Vault | Free Gaming App",
  description: "The #1 rated video game tracker app. Track your gaming progress, achievements, and backlog across all platforms. Join 50,000+ gamers using the best free game tracker in 2025!",
  keywords: ["best video game tracker", "video game tracker app", "free video game tracker 2025", "gaming progress tracker", "video game achievement tracker", "gaming backlog tracker", "track video games online", "game collection manager"],
  alternates: {
    canonical: "https://gamersvaultapp.com",
  },
  openGraph: {
    title: "Best Video Game Tracker 2025 - Game Vault",
    description: "The #1 video game tracker app with 50k+ users. Track games, achievements & progress across all platforms. Free forever!",
    type: "website",
    url: "https://gamersvaultapp.com",
    siteName: "Game Vault"
  },
  twitter: {
    title: "Best Video Game Tracker App - Game Vault",
    description: "Track your gaming progress & achievements with the top-rated free video game tracker. Join 50k+ gamers!",
    card: "summary_large_image"
  }
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
