import { createClient } from "@/utils/supabase/server";
import { AuthenticatedHome } from "@/components/home/authenticated-home";
import { UnauthenticatedHome } from "@/components/home/unauthenticated-home";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return <AuthenticatedHome user={session.user} />;
  }

  return <UnauthenticatedHome />;
}
