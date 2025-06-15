import { createClient } from "@/utils/supabase/server";
import { AuthenticatedHome } from "@/components/home/authenticated-home";
import { UnauthenticatedHome } from "@/components/home/unauthenticated-home";
import type { Database } from "@/types/supabase";

// Extended User type that includes profile (same as auth store)
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ExtendedUser = {
  id: string;
  email?: string;
  user_metadata?: any;
  profile?: Profile | null;
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
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Handle profile fetch errors gracefully
        if (profileError) {
          console.warn("Profile fetch error:", profileError.message);
        }

        // Create extended user object with profile
        const extendedUser: ExtendedUser = {
          ...user,
          profile: profile || null,
        };

        return <AuthenticatedHome user={extendedUser as any} />;
      } catch (profileError) {
        console.warn("Error fetching user profile during build:", profileError);
        // Still show authenticated home with user data, just without profile
        const extendedUser: ExtendedUser = {
          ...user,
          profile: null,
        };
        return <AuthenticatedHome user={extendedUser as any} />;
      }
    }

    return <UnauthenticatedHome />;
  } catch (error) {
    // Catch any build-time errors and fall back to unauthenticated view
    console.warn("Build-time error in HomePage:", error);
    return <UnauthenticatedHome />;
  }
}
