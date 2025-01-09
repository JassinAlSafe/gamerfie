"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { toast } from "react-hot-toast";

interface GameNotesProps {
  gameId: string;
}

export function GameNotes({ gameId }: GameNotesProps) {
  const [notes, setNotes] = useState("");
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient<Database>();

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
      }
    };

    fetchNotes();
  }, [gameId, supabase, mounted]);

  const handleNotesSubmit = async () => {
    try {
      const { error } = await supabase
        .from("user_games")
        .update({ notes })
        .eq("game_id", gameId);

      if (error) throw error;
      toast.success("Notes saved successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };

  if (!mounted) {
    return (
      <div className="p-2 bg-gray-900 rounded-md">
        <div className="w-full h-24 bg-gray-800/50 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="p-2 bg-gray-900 rounded-md">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes here..."
          className="w-full h-24 bg-transparent border-0 text-white placeholder-gray-500 resize-none focus:ring-0"
        />
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            onClick={handleNotesSubmit}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            Save Notes
          </Button>
        </div>
      </div>
    </div>
  );
}
