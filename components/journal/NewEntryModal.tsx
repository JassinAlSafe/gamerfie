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
import type { JournalEntryType, JournalEntry } from "@/stores/useJournalStore";

export interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: JournalEntryType;
}

export function NewEntryModal({ isOpen, onClose }: NewEntryModalProps) {
  const [entryType, setEntryType] = useState<JournalEntryType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const addEntry = useJournalStore((state) => state.addEntry);
  const error = useJournalStore((state) => state.error);

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      // Create the entry object with proper typing
      const entryData: Omit<JournalEntry, "id" | "createdAt" | "updatedAt"> = {
        type: entryType!,
        date: new Date().toISOString().split("T")[0],
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

      await addEntry(entryData);
      setEntryType(null);
      onClose();
    } catch (error) {
      console.error("Failed to save entry:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setEntryType(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal>
      <DialogContent
        className="sm:max-w-[425px] bg-gray-900 border-gray-800"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-white">New Journal Entry</DialogTitle>
          <DialogDescription className="text-gray-400">
            {entryType
              ? `Create a new ${entryType} entry.`
              : "Choose the type of entry you want to create."}
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
