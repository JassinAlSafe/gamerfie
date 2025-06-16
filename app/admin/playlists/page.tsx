"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader2 } from "lucide-react";
import PlaylistDashboard from "@/components/admin/playlist/PlaylistDashboard";

export default function PlaylistsAdminPage() {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      // Check if user is admin
      if (!user?.profile?.role || user.profile.role !== "admin") {
        router.push("/");
        return;
      }
    }
  }, [user, isInitialized, router]);

  // Show loading while checking authentication
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Redirect if not admin
  if (!user?.profile?.role || user.profile.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <PlaylistDashboard />
    </div>
  );
}
