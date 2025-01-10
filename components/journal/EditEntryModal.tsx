import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EntryForm } from "./EntryForm";
import { useJournalStore } from "@/stores/useJournalStore";
import type { JournalEntry } from "@/stores/useJournalStore";

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry;
}

export function EditEntryModal({
  isOpen,
  onClose,
  entry,
}: EditEntryModalProps) {
  const updateEntry = useJournalStore((state) => state.updateEntry);

  const handleSave = (formData: any) => {
    // Extract game details if present
    const { game_id, game, cover_url, ...otherData } = formData;

    // Create the entry object
    const entryData = {
      ...otherData,
    };

    // Add game details if this is a game-related entry
    if (game) {
      entryData.game = game;
      entryData.game_id = game_id;
      entryData.cover_url = cover_url;
    }

    updateEntry(entry.id, entryData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent
        className="sm:max-w-[425px] bg-gray-900 border-gray-800"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-white">Edit Journal Entry</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update your {entry.type} entry.
          </DialogDescription>
        </DialogHeader>
        <div className="focus-visible:outline-none">
          <EntryForm
            type={entry.type}
            onSave={handleSave}
            onCancel={onClose}
            initialData={entry}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
