"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { GameStatus } from "@/types/game";
import { Database } from "@/types/supabase";
import { GameNotes } from "./game-notes";

interface GameStatusDropdownProps {
  status: GameStatus;
  gameId: string;
  onStatusChange: (status: GameStatus) => void;
}

const statusOptions = [
  {
    value: "want_to_play" as GameStatus,
    label: "Want to Play",
    color: "text-yellow-400",
  },
  {
    value: "playing" as GameStatus,
    label: "Playing",
    color: "text-green-400",
  },
  {
    value: "completed" as GameStatus,
    label: "Completed",
    color: "text-blue-400",
  },
  { value: "dropped" as GameStatus, label: "Dropped", color: "text-red-400" },
];

export function GameStatusDropdown({
  status,
  gameId,
  onStatusChange,
}: GameStatusDropdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[300px] bg-gray-800 border border-white/10 rounded-lg shadow-lg"
      >
        <div className="p-2 space-y-2">
          {/* Status Options */}
          <div className="space-y-1">
            <DropdownMenuLabel className="text-sm font-medium text-gray-400">
              Status
            </DropdownMenuLabel>
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`${status === option.value ? "bg-gray-700" : ""} ${
                  option.color
                } hover:bg-gray-700/50 transition-colors duration-200`}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="bg-gray-700" />

          {/* Notes Section */}
          <div className="space-y-2">
            <DropdownMenuLabel className="text-sm font-medium text-gray-400">
              Notes
            </DropdownMenuLabel>
            <GameNotes gameId={gameId} />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
