"use client";

import { useEffect, useMemo, useState } from "react";
import { useJournalStore, type JournalEntry } from "@/stores/useJournalStore";
import { Button } from "@/components/ui/button";
import { PlusIcon, EditIcon, Trash2Icon } from "lucide-react";
import { NewEntryModal } from "@/components/journal/NewEntryModal";
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/image-utils";
import { EditEntryModal } from "@/components/journal/EditEntryModal";
import { DeleteEntryDialog } from "@/components/journal/DeleteEntryDialog";
import { LoadingSpinner } from "@/components/loadingSpinner";

export default function ReviewsClient() {
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);
  const { entries, fetchEntries, deleteEntry } = useJournalStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      setIsLoading(true);
      await fetchEntries();
      setIsLoading(false);
    };
    loadEntries();
  }, [fetchEntries]);

  const reviews = useMemo(() => {
    return entries
      .filter((entry) => entry.type === "review")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const handleDelete = async () => {
    if (deletingEntry) {
      await deleteEntry(deletingEntry.id);
      setDeletingEntry(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setIsNewEntryModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Review
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="group relative bg-gray-800/50 rounded-lg p-4 space-y-4"
          >
            {/* Game Info */}
            {review.game && (
              <div className="flex gap-4">
                <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      review.game.cover_url
                        ? getCoverImageUrl(review.game.cover_url)
                        : "/images/placeholders/game-cover.jpg"
                    }
                    alt={`Cover for ${review.game.name}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    quality={90}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg text-white line-clamp-2">
                    {review.game.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-4 rounded-sm ${
                            i < (review.rating || 0)
                              ? "bg-white"
                              : "bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {review.rating}/10
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Review Content */}
            <p className="text-sm text-gray-400 line-clamp-3">
              {review.content}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4">
              <time className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </time>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingEntry(review)}
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingEntry(review)}
                  className="h-8 w-8 text-gray-400 hover:text-red-400"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NewEntryModal
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
        type="review"
      />

      {editingEntry && (
        <EditEntryModal
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          entry={editingEntry}
        />
      )}

      <DeleteEntryDialog
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleDelete}
      />

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No reviews yet. Start by adding one!</p>
        </div>
      )}
    </div>
  );
}
