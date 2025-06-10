"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function GoogleSignin() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Error signing in with Google:", error);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={loading}
      variant="outline"
      className="w-full"
    >
      {loading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
