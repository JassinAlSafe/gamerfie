"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();

      if (error) {
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
        router.push("/signin");
      } else {
        toast({
          title: "Authentication successful",
          description: "You've been successfully signed in.",
          duration: 5000,
        });
        router.push("/dashboard");
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-medium">
        Completing authentication, please wait...
      </p>
    </div>
  );
}
