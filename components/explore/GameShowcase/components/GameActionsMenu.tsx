import { memo, useState, useEffect } from "react";
import {
  Gamepad2,
  Share2,
  ThumbsUp,
  BookMarked,
  Copy,
  Plus,
  Check,
  Clock,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthCheck } from "@/components/auth/AuthCheck";
import { Game, GameStatus } from "@/types/game";
import { useProgressStore } from "@/stores/useProgressStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { toast } from "sonner";
import { AddToLibraryButton } from "@/components/add-to-library-button";

interface GameActionsMenuProps {
  game: Game;
  trigger?: React.ReactNode;
}

const STATUS_OPTIONS = [
  { value: "playing", label: "Currently Playing", icon: Clock },
  { value: "completed", label: "Completed", icon: Check },
  { value: "want_to_play", label: "Want to Play", icon: Plus },
  { value: "dropped", label: "Dropped", icon: X },
] as const;

export const GameActionsMenu = memo(
  ({ game, trigger }: GameActionsMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isInLibrary, setIsInLibrary] = useState(false);
    const { user } = useAuthStore();
    const updateGameStatus = useProgressStore(
      (state) => state.updateGameStatus
    );
    const { games, fetchUserLibrary } = useLibraryStore();
    const { createActivity } = useFriendsStore();

    useEffect(() => {
      if (user?.id) {
        fetchUserLibrary(user.id);
      }
    }, [user?.id, fetchUserLibrary]);

    useEffect(() => {
      setIsInLibrary(games.some((g) => g.id === game.id));
    }, [games, game.id]);

    const handleStatusChange = async (status: GameStatus) => {
      if (!user?.id) return;

      try {
        await updateGameStatus(user.id, game.id, status, {
          play_time: 0,
          completion_percentage: 0,
          achievements_completed: 0,
        });

        toast.success(`Game marked as ${status.replace("_", " ")}`);
        setIsOpen(false);

        // Refresh the library to update the UI
        if (user?.id) {
          fetchUserLibrary(user.id);
        }
      } catch (error) {
        toast.error("Failed to update game status");
        console.error("Error updating game status:", error);
      }
    };

    const title = game.title || game.name || "Untitled Game";

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              size="icon"
              variant="ghost"
              className="absolute bottom-3 right-3 w-7 h-7 bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 hover:from-zinc-700/95 hover:to-zinc-800/95 text-zinc-300 z-10 rounded-[4px] shadow-sm backdrop-blur-sm border border-zinc-800/50"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <AuthCheck>
              <div className="space-y-2">
                <div className="px-2 py-1 text-sm font-medium text-white/60">
                  {isInLibrary ? "Update Status" : "Add to Library"}
                </div>
                {!isInLibrary ? (
                  <AddToLibraryButton
                    gameId={game.id}
                    gameName={title}
                    cover={game.cover_url || game.coverImage}
                    rating={game.rating}
                    releaseDate={game.first_release_date}
                    platforms={game.platforms}
                    genres={game.genres}
                    summary={game.summary}
                    onSuccess={(status) => {
                      setIsInLibrary(true);
                      setIsOpen(false);
                      if (user?.id) {
                        fetchUserLibrary(user.id);
                      }
                    }}
                  />
                ) : (
                  STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant="ghost"
                      className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                      onClick={() => handleStatusChange(value)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </Button>
                  ))
                )}
              </div>
            </AuthCheck>

            <div className="my-2 border-t border-zinc-800" />

            <Button
              variant="ghost"
              className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            >
              <Copy className="mr-2 h-4 w-4" />
              Select multiple games
            </Button>

            <div className="my-2 border-t border-zinc-800" />

            <Button
              variant="ghost"
              className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
              asChild
            >
              <a href={`/games/${game.id}`}>
                <Gamepad2 className="mr-2 h-4 w-4" />
                Go to game
              </a>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
              asChild
            >
              <a href={`/games/${game.id}/guide`}>
                <BookMarked className="mr-2 h-4 w-4" />
                Go to guide
              </a>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share game
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Rate
            </Button>
          </div>
          <div className="mt-4 border-t border-zinc-800 pt-4">
            <Button
              variant="ghost"
              className="w-full justify-center text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

GameActionsMenu.displayName = "GameActionsMenu";
