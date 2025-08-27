"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Save, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Debounce utility
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface GameNotesProps {
  gameId: string;
}

export function GameNotes({ gameId }: GameNotesProps) {
  const [notes, setNotes] = useState("");
  const [originalNotes, setOriginalNotes] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const supabase = createClient();
  
  // Auto-save with debounce
  const debouncedNotes = useDebounce(notes, 2000);
  
  const MAX_CHARACTERS = 500;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch existing notes when component mounts
  useEffect(() => {
    if (!mounted) return;

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("user_games")
        .select("notes")
        .eq("game_id", gameId)
        .single();

      if (error) {
        console.error("Error fetching notes:", error);
        return;
      }

      if (data?.notes) {
        setNotes(data.notes);
        setOriginalNotes(data.notes);
      }
    };

    fetchNotes();
  }, [gameId, supabase, mounted]);

  const handleNotesSubmit = useCallback(async (notesToSave: string) => {
    if (notesToSave === originalNotes) return; // No changes
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("user_games")
        .update({ notes: notesToSave })
        .eq("game_id", gameId);

      if (error) throw error;
      
      setOriginalNotes(notesToSave);
      setLastSaved(new Date());
      // Only show toast for manual saves, not auto-saves
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  }, [gameId, supabase, originalNotes]);
  
  // Auto-save effect
  useEffect(() => {
    if (debouncedNotes !== originalNotes && mounted) {
      handleNotesSubmit(debouncedNotes);
    }
  }, [debouncedNotes, handleNotesSubmit, mounted, originalNotes]);
  
  const handleManualSave = () => {
    handleNotesSubmit(notes);
    toast.success("Notes saved!");
  };
  
  const hasChanges = notes !== originalNotes;
  const charactersLeft = MAX_CHARACTERS - notes.length;
  const isOverLimit = charactersLeft < 0;

  if (!mounted) {
    return (
      <div className="p-3 bg-gray-800/50 rounded-lg">
        <div className="w-full h-20 bg-gray-700/50 animate-pulse rounded-md" />
        <div className="flex justify-between mt-2">
          <div className="w-20 h-3 bg-gray-700/50 animate-pulse rounded" />
          <div className="w-16 h-6 bg-gray-700/50 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div 
        className="relative"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Notes Textarea */}
        <div className="relative p-3 bg-gray-800/50 rounded-lg border border-white/5 focus-within:border-purple-500/30 transition-colors">
          <div className="absolute top-2 left-2 flex items-center gap-1 text-gray-500">
            <FileText className="w-3 h-3" />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, MAX_CHARACTERS))}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Add your thoughts, progress, or reminders about this game..."
            className="w-full h-20 bg-transparent border-0 text-white placeholder-gray-500 resize-none focus:ring-0 pl-6 pt-1 text-sm leading-relaxed"
            maxLength={MAX_CHARACTERS}
          />
          
          {/* Auto-save indicator */}
          {isSaving && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-purple-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              Saving...
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          {/* Character Counter */}
          <div className={cn(
            "text-xs transition-colors",
            isOverLimit ? "text-red-400" : charactersLeft < 50 ? "text-yellow-400" : "text-gray-500"
          )}>
            {charactersLeft} characters left
          </div>
          
          {/* Save Status & Button */}
          <div className="flex items-center gap-2">
            {lastSaved && !hasChanges && (
              <span className="text-xs text-gray-500">
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            
            {hasChanges && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleManualSave();
                }}
                disabled={isSaving || isOverLimit}
                className="bg-purple-500/90 hover:bg-purple-500 text-white text-xs px-3 py-1 h-7"
              >
                <Save className="w-3 h-3 mr-1" />
                Save Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
