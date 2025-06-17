"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PlaylistEditor from "@/components/admin/playlist/PlaylistEditor";
import { PlaylistService } from "@/services/playlistService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Playlist } from "@/types/playlist";

export default function EditPlaylistPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.profile?.role || user.profile.role !== "admin") {
      router.push("/");
      return;
    }

    if (id) {
      PlaylistService.getPlaylist(id as string)
        .then((result) => {
          setPlaylist(result);
        })
        .catch((error) => {
          console.error(`Failed to fetch playlist:`, error);
          setPlaylist(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, user, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!playlist) {
    return <div>Playlist not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Edit Playlist: {playlist.title}
      </h1>
      <PlaylistEditor initialPlaylist={playlist} />
    </div>
  );
}
