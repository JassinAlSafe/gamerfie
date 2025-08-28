import { createClient } from "@/utils/supabase/server";
import { AuthenticatedHome } from "@/components/home/authenticated-home";
import { UnauthenticatedHome } from "@/components/home/unauthenticated-home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://gamerfie.vercel.app"
      : "http://localhost:3000"
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
      return <UnauthenticatedHome />;
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
      return <UnauthenticatedHome />;
    }

    if (user) {
      try {
        // Fetch the user's profile from the profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Handle profile fetch errors gracefully
        if (profileError) {
          console.warn("Profile fetch error:", profileError.message);
        }

        return <AuthenticatedHome user={user} />;
      } catch (profileError) {
        console.warn("Error fetching user profile during build:", profileError);
        // Still show authenticated home with user data, just without profile
        return <AuthenticatedHome user={user} />;
      }
    }

    return <UnauthenticatedHome />;
  } catch (error) {
    // Catch any build-time errors and fall back to unauthenticated view
    console.warn("Build-time error in HomePage:", error);
    return <UnauthenticatedHome />;
  }
}
