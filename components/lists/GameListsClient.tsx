"use client";

import { useEffect } from "react";
import { useJournalStore } from "@/stores/useJournalStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModal";
import CreateListModal from "./CreateListModal";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

export default function GameListsClient() {
  const {
    entries,
    loading: isLoading,
    error,
    fetchEntries,
  } = useJournalStore();
  const router = useRouter();
  const { openModal } = useModal();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Filter only list type entries and ensure they have games array
  const lists = entries
    .filter((entry) => entry.type === "list")
    .map((entry) => ({
      ...entry,
      games: entry.games || [],
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => fetchEntries()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Game Lists</h1>
        <Button
          onClick={() => openModal(<CreateListModal />)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white"
          variant="ghost"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Create List
        </Button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-xl font-semibold mb-2">No Lists Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first game list to start organizing your games
          </p>
          <Button
            onClick={() => openModal(<CreateListModal />)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First List
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lists.map((list) => (
            <div
              key={list.id}
              className="group relative bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-lg overflow-hidden cursor-pointer border border-white/10"
              onClick={() => router.push(`/profile/lists/${list.id}`)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{list.title}</h2>
                    <p className="text-sm text-white/60">
                      Updated{" "}
                      {formatDistanceToNow(new Date(list.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-white/60">
                    {list.games.length}{" "}
                    {list.games.length === 1 ? "game" : "games"}
                  </p>
                </div>

                {list.content && (
                  <p className="text-sm text-white/80 mb-6 line-clamp-2">
                    {list.content}
                  </p>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {list.games.slice(0, 4).map((game) => (
                    <div
                      key={game.id}
                      className="relative aspect-[3/4] rounded-md overflow-hidden group/game"
                    >
                      {game.cover_url ? (
                        <Image
                          src={game.cover_url}
                          alt={game.name}
                          fill
                          className="object-cover transition-transform group-hover/game:scale-110"
                          sizes="(max-width: 768px) 25vw, 20vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                          <span className="text-xs text-white/40">
                            No Cover
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover/game:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-xs font-medium line-clamp-2">
                            {game.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Placeholder covers if less than 4 games */}
                  {Array.from({
                    length: Math.max(0, 4 - list.games.length),
                  }).map((_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="relative aspect-[3/4] rounded-md bg-white/5 border border-white/10"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
