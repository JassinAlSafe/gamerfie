"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function GoogleSignIn() {
  const supabase = createClientComponentClient();

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  }

  return (
    <Button onClick={signInWithGoogle} className="w-full">
      <Icons.login className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
}
