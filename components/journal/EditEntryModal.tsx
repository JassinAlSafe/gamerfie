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
  const [isSaving, setIsSaving] = useState(false);
  const updateEntry = useJournalStore((state) => state.updateEntry);
  const error = useJournalStore((state) => state.error);

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      // Create the entry object with proper typing
      const entryData: Partial<JournalEntry> = {
        title: formData.title || "",
        content: formData.content || "",
        progress: formData.progress ? Number(formData.progress) : undefined,
        hoursPlayed: formData.hoursPlayed
          ? Number(formData.hoursPlayed)
          : undefined,
        rating: formData.rating ? Number(formData.rating) : undefined,
        game: formData.game
          ? {
              id: formData.game.id,
              name: formData.game.name,
              cover_url: formData.game.cover_url,
            }
          : undefined,
      };

      await updateEntry(entry.id, entryData);
      onClose();
    } catch (error) {
      console.error("Failed to update entry:", error);
    } finally {
      setIsSaving(false);
    }
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
            disabled={isSaving}
          />
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
