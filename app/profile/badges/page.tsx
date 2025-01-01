"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserBadges } from "@/components/profile/UserBadges";
import { useRouter } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function BadgesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/login");
        return;
      }

      setUserId(session.user.id);
    };

    checkUser();
  }, []);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen pt-20 pb-10">
      <BackgroundBeams className="opacity-20" />
      <div className="container mx-auto px-4">
        <UserBadges userId={userId} />
      </div>
    </main>
  );
}
