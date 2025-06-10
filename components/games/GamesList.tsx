import { Game, GameStatus } from "@/types";
import { GameMutationHandlers } from "@/types/mutations";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCoverImageUrl } from "@/utils/image-utils";

interface LibraryGameCardProps {
  game: Game;
  status: GameStatus;
  isPriority?: boolean;
  onStatusChange: (status: GameStatus) => void;
  onRemove: () => void;
  onReviewUpdate: (rating: number, reviewText: string) => void;
}

function LibraryGameCard({
  game,
  status,
  isPriority = false,
  onStatusChange,
  onRemove,
  onReviewUpdate: _onReviewUpdate,
}: LibraryGameCardProps) {
  const [isLoading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const coverUrl = (() => {
    if (imageError) return "/placeholder.png";
    if (
      !game.cover_url &&
      (!game.cover || typeof game.cover !== "object" || !game.cover.url)
    )
      return "/placeholder.png";

    const rawUrl =
      game.cover_url ||
      (game.cover && typeof game.cover === "object"
        ? game.cover.url
        : undefined);
    if (rawUrl?.startsWith("https://")) return rawUrl;
    return getCoverImageUrl(rawUrl || "");
  })();

  const formatStatus = (gameStatus: GameStatus): string => {
    const statusMap = {
      playing: "Playing",
      completed: "Completed",
      want_to_play: "Want to Play",
      dropped: "Dropped",
    };
    return statusMap[gameStatus] || "Unknown";
  };

  return (
    <div className="group relative block w-full overflow-hidden rounded-xl bg-gradient-to-b from-gray-900/90 to-gray-950 shadow-lg ring-1 ring-gray-800/10 transition-all duration-300 hover:ring-purple-500/20 hover:ring-2 hover:shadow-purple-500/10">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-gray-900/80 hover:bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange("playing")}>
              Mark as Playing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("completed")}>
              Mark as Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("want_to_play")}>
              Mark as Want to Play
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("dropped")}>
              Mark as Dropped
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/game/${game.id}`} className="block">
        <div className="relative flex flex-col h-full">
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <Image
              src={coverUrl}
              alt={`Cover image for ${game.name}`}
              fill
              priority={isPriority}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`
                object-cover w-full h-full transition-all duration-500
                ${isLoading ? "scale-110 blur-2xl" : "scale-100 blur-0"}
                group-hover:scale-105
              `}
              quality={90}
              onLoad={() => setLoading(false)}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300">
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-300">
                {formatStatus(status)}
              </span>
            </div>
            <h3 className="font-semibold text-white truncate mb-2 text-lg group-hover:text-purple-300 transition-colors duration-300">
              {game.name}
            </h3>
            <div className="flex items-center justify-between">
              {"first_release_date" in game && game.first_release_date && (
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors duration-300">
                  {new Date(game.first_release_date * 1000).getFullYear()}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-200 group-hover:text-white transition-colors duration-300">
                {(game as any).total_rating && (
                  <>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{Math.round((game as any).total_rating)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

interface GamesListProps {
  games: Game[];
  mutations: GameMutationHandlers;
}

export function GamesList({ games, mutations }: GamesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game, index) => (
        <LibraryGameCard
          key={game.id}
          game={game}
          status={(game as any).status || "want_to_play"}
          isPriority={index < 4}
          onStatusChange={(status: GameStatus) =>
            mutations.updateGameStatus.mutate({ gameId: game.id, status })
          }
          onRemove={() => mutations.removeFromLibrary.mutate(game.id)}
          onReviewUpdate={(rating: number, reviewText: string) =>
            mutations.updateReview.mutate({
              gameId: game.id,
              review: reviewText,
              rating,
            })
          }
        />
      ))}
    </div>
  );
}
