"use client";

import { useEffect, useState } from "react";
import { GameShowcase } from "@/components/explore/GameShowcase/GameShowcase";
import { PlaylistService } from "@/services/playlistService";
import { Playlist } from "@/types/playlist";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const fetchedPlaylists = await PlaylistService.getPlaylists();
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlaylists();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Game Playlists</h1>
        <p className="text-gray-500">Discover curated collections of games.</p>
      </div>

      {playlists.map((playlist) => (
        <GameShowcase
          key={playlist.id}
          playlistId={playlist.id}
          title={playlist.title}
          description={playlist.description}
          date={new Date(playlist.createdAt).toLocaleDateString()}
          type={playlist.type}
        />
      ))}

      {playlists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No playlists available.</p>
        </div>
      )}
    </div>
  );
}
