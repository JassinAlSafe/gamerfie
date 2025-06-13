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
  const supabase = await createClient();

  // Use getUser() instead of getSession() for security
  // getUser() authenticates the data by contacting the Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Fetch the user's profile from the profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Create extended user object with profile
    const extendedUser: ExtendedUser = {
      ...user,
      profile: profile || null,
    };

    return <AuthenticatedHome user={extendedUser as any} />;
  }

  return <UnauthenticatedHome />;
}
