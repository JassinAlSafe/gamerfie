"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useJournalStore } from "@/stores/useJournalStore";
import type { JournalEntryType, JournalEntry } from "@/stores/useJournalStore";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  Star,
  Calendar,
  BookOpen,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { EntryForm } from "./EntryForm";
import { toast } from "react-hot-toast";

export interface JournalEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: JournalEntryType;
  entry?: JournalEntry; // If provided, we're in edit mode
}

export function JournalEntryDialog({
  isOpen,
  onClose,
  initialType,
  entry,
}: JournalEntryDialogProps) {
  const [entryType, setEntryType] = useState<JournalEntryType | null>(
    entry ? entry.type : initialType || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<"type" | "form">(
    entry || initialType ? "form" : "type"
  );

  const addEntry = useJournalStore((state) => state.addEntry);
  const updateEntry = useJournalStore((state) => state.updateEntry);
  const error = useJournalStore((state) => state.error);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setEntryType(entry ? entry.type : initialType || null);
      setStep(entry || initialType ? "form" : "type");
    }
  }, [isOpen, entry, initialType]);

  const isEditMode = !!entry;

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      if (isEditMode && entry) {
        // Update existing entry
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
        toast.success("Journal entry updated successfully");
      } else {
        // Create new entry
        const entryData: Omit<JournalEntry, "id" | "createdAt" | "updatedAt"> =
          {
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
        toast.success("New journal entry created successfully");
      }

      handleClose();
    } catch (error) {
      console.error("Failed to save entry:", error);
      toast.error("Failed to save journal entry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  const handleBack = () => {
    setStep("type");
  };

  const handleTypeSelect = (type: JournalEntryType) => {
    setEntryType(type);
    setStep("form");
  };

  // Entry type definitions with icons and descriptions
  const entryTypes = [
    {
      id: "progress" as JournalEntryType,
      label: "Progress Update",
      description: "Log your progress for a specific game.",
      icon: <BarChart2 className="h-5 w-5 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
      hoverColor: "hover:bg-emerald-500/10",
    },
    {
      id: "review" as JournalEntryType,
      label: "Game Review",
      description: "Review a game you've recently played.",
      icon: <Star className="h-5 w-5 text-amber-400" />,
      color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
      hoverColor: "hover:bg-amber-500/10",
    },
    {
      id: "daily" as JournalEntryType,
      label: "Daily Log",
      description: "Write about your overall gaming day or week.",
      icon: <Calendar className="h-5 w-5 text-blue-400" />,
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
      hoverColor: "hover:bg-blue-500/10",
    },
    {
      id: "list" as JournalEntryType,
      label: "Custom List",
      description: "Create a personalized list (e.g., Top 10 RPGs).",
      icon: <BookOpen className="h-5 w-5 text-purple-400" />,
      color: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
      hoverColor: "hover:bg-purple-500/10",
    },
  ];

  // Find the current entry type details
  const currentTypeDetails = entryType
    ? entryTypes.find((t) => t.id === entryType)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[550px] bg-gray-900 border border-gray-800 shadow-xl rounded-xl overflow-hidden p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="relative">
          {/* Background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              currentTypeDetails?.color || "from-purple-500/20 to-indigo-500/10"
            } opacity-50`}
          ></div>

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:8px_8px] opacity-30"></div>

          <div className="relative p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-3">
                {step === "form" && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="h-8 w-8 rounded-full bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    {isEditMode
                      ? "Edit Journal Entry"
                      : step === "type"
                      ? "Create New Journal Entry"
                      : `New ${currentTypeDetails?.label}`}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400 mt-1">
                    {step === "type"
                      ? "Choose the type of entry you want to create"
                      : isEditMode
                      ? `Update your ${entry.type} entry`
                      : currentTypeDetails?.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <AnimatePresence mode="wait">
              {step === "type" ? (
                <motion.div
                  key="type-selector"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 gap-4 py-2"
                >
                  {entryTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border ${type.color} ${type.hoverColor} transition-all duration-200 text-left`}
                    >
                      <div
                        className={`p-3 rounded-lg bg-gray-900/50 backdrop-blur-sm border ${type.color}`}
                      >
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {type.label}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {type.description}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="entry-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="focus-visible:outline-none"
                >
                  <EntryForm
                    type={entryType!}
                    onSave={handleSave}
                    onCancel={isEditMode ? handleClose : handleBack}
                    initialData={entry}
                    disabled={isSaving}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
