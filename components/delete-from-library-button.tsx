import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "./loadingSpinner";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useErrorStore } from "@/stores/useErrorStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface DeleteFromLibraryButtonProps {
  gameId: string;
  gameName: string;
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
  className?: string;
  onSuccess?: () => void;
}

export function DeleteFromLibraryButton({
  gameId,
  gameName,
  variant = "destructive",
  size = "default",
  className,
  onSuccess,
}: DeleteFromLibraryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();
  const { removeGame } = useLibraryStore();
  const { addError } = useErrorStore();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await removeGame(gameId);
      toast.success("Game removed from library");
      setShowConfirmDialog(false);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Error removing game:", error);
      addError("api", "Failed to remove game from library");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowConfirmDialog(true)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Remove from Library
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Game from Library</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {gameName} from your library? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Removing...
                </>
              ) : (
                "Remove Game"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
