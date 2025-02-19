import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { AuthenticatedHome } from "@/components/home/authenticated-home";
import { UnauthenticatedHome } from "@/components/home/unauthenticated-home";

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return <AuthenticatedHome user={session.user} />;
  }

  return <UnauthenticatedHome />;
}
