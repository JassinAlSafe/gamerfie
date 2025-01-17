"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EntryTypeSelector } from "./EntryTypeSelector";
import { EntryForm } from "./EntryForm";
import { useJournalStore } from "@/stores/useJournalStore";

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EntryFormData {
  title?: string;
  content?: string;
  progress?: number;
  hoursPlayed?: number;
  rating?: number;
  game?: {
    id: string;
    name: string;
    cover_url: string;
  };
}

export function NewEntryModal({ isOpen, onClose }: NewEntryModalProps) {
  const [entryType, setEntryType] = useState<
    "progress" | "review" | "daily" | "list" | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const createEntry = useJournalStore((state) => state.createEntry);
  const fetchEntries = useJournalStore((state) => state.fetchEntries);
  const error = useJournalStore((state) => state.error);

  const handleSave = async (formData: EntryFormData) => {
    if (!entryType) return;

    setIsSaving(true);
    try {
      await createEntry(entryType, {
        title: formData.title || "",
        content: formData.content || "",
        progress: formData.progress,
        hours_played: formData.hoursPlayed,
        rating: formData.rating,
        game: formData.game
          ? {
              id: formData.game.id,
              name: formData.game.name,
              cover_url: formData.game.cover_url,
            }
          : undefined,
      });

      // Refresh entries after successful creation
      await fetchEntries();

      setEntryType(null);
      onClose();
    } catch (error) {
      console.error("Failed to save entry:", error);
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
          <DialogTitle className="text-white">New Journal Entry</DialogTitle>
          <DialogDescription className="text-gray-400">
            {entryType
              ? `Create a new ${entryType} entry`
              : "Choose the type of entry you want to create"}
          </DialogDescription>
        </DialogHeader>
        <div className="focus-visible:outline-none">
          {!entryType ? (
            <EntryTypeSelector onSelect={setEntryType} />
          ) : (
            <EntryForm
              type={entryType}
              onSave={handleSave}
              onCancel={() => setEntryType(null)}
              disabled={isSaving}
            />
          )}
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
