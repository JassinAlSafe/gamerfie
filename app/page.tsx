import { createClient } from "@/utils/supabase/server";
import { AuthenticatedHome } from "@/components/home/authenticated-home";
import { UnauthenticatedHome } from "@/components/home/unauthenticated-home";

export default async function HomePage() {
  const supabase = await createClient();

  // Use getUser() instead of getSession() for security
  // getUser() authenticates the data by contacting the Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return <AuthenticatedHome user={user} />;
  }

  return <UnauthenticatedHome />;
}
