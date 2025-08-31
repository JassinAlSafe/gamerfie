"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { DatabaseHealth } from "@/components/admin/DatabaseHealth";
import { Loader2 } from "lucide-react";

export default function DatabaseAdminPage() {
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DatabaseHealth />
      </div>
    </div>
  );
}
