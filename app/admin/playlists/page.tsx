"use client";

import { PlaylistManager } from "@/components/admin/PlaylistManager";

export default function PlaylistsAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Playlists</h1>
        <p className="text-gray-500">
          Create and manage playlists to showcase games to your users.
        </p>
      </div>

      <PlaylistManager />
    </div>
  );
}
