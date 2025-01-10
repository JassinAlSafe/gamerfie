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
import type { JournalEntryType } from "@/stores/useJournalStore";

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewEntryModal({ isOpen, onClose }: NewEntryModalProps) {
  const [entryType, setEntryType] = useState<JournalEntryType | null>(null);
  const addEntry = useJournalStore((state) => state.addEntry);

  const handleSave = (formData: any) => {
    // Extract game details if present
    const { game_id, game, cover_url, ...otherData } = formData;

    // Create the entry object
    const entryData = {
      type: entryType!,
      date: new Date().toISOString().split("T")[0],
      ...otherData,
    };

    // Add game details if this is a game-related entry
    if (game) {
      entryData.game = game;
      entryData.game_id = game_id;
      entryData.cover_url = cover_url;
    }

    addEntry(entryData);
    setEntryType(null);
    onClose();
  };

  const handleClose = () => {
    setEntryType(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal>
      <DialogContent
        className="sm:max-w-[425px] bg-gray-900 border-gray-800"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-white">
            Create New Journal Entry
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {!entryType
              ? "Choose the type of journal entry you want to create."
              : `Create a new ${entryType} entry for your gaming journal.`}
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
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
