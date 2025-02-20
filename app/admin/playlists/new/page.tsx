"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlaylistManager } from "@/components/admin/PlaylistManager";
import { useAuthStore } from "@/stores/useAuthStore";

export default function NewPlaylistPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.profile?.role || user.profile.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Playlist</h1>
      <PlaylistManager />
    </div>
  );
}
