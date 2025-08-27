"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Clock, Trophy, Target, X, Check } from "lucide-react";
import { GameStatus } from "../../types/game";
import { GameNotes } from "./game-notes";
import { cn } from "@/lib/utils";

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
    bgColor: "bg-yellow-400",
    icon: Target,
    description: "Add to your backlog",
  },
  {
    value: "playing" as GameStatus,
    label: "Playing",
    color: "text-green-400",
    bgColor: "bg-green-400",
    icon: Clock,
    description: "Currently playing",
  },
  {
    value: "completed" as GameStatus,
    label: "Completed",
    color: "text-blue-400",
    bgColor: "bg-blue-400",
    icon: Trophy,
    description: "Finished this game",
  },
  {
    value: "dropped" as GameStatus,
    label: "Dropped",
    color: "text-red-400",
    bgColor: "bg-red-400",
    icon: X,
    description: "Stopped playing",
  },
];

export function GameStatusDropdown({
  status,
  gameId,
  onStatusChange,
}: GameStatusDropdownProps) {
  const [mounted, setMounted] = useState(false);
  const currentStatus = statusOptions.find(option => option.value === status);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 min-w-[32px] px-2 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-gray-600" />
        <ChevronDown className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 min-w-[32px] px-2 flex items-center gap-1.5 hover:bg-white/5 transition-colors",
            "border border-transparent hover:border-white/10 rounded-lg"
          )}
        >
          <div className={cn("w-2 h-2 rounded-full", currentStatus?.bgColor || "bg-gray-600")} />
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[320px] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 animate-in fade-in-0 zoom-in-95 duration-200"
        sideOffset={8}
      >
        <div className="p-3 space-y-3">
          {/* Status Options */}
          <div className="space-y-2">
            <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </DropdownMenuLabel>
            <div className="space-y-1">
              {statusOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = status === option.value;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => onStatusChange(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                      "hover:bg-white/5 focus:bg-white/10",
                      isSelected && "bg-white/10 border border-white/20"
                    )}
                  >
                    {/* Status Indicator */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative flex items-center justify-center">
                        <div className={cn("w-2 h-2 rounded-full", option.bgColor)} />
                        <IconComponent className={cn("w-4 h-4 ml-2", option.color)} />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-medium text-sm",
                          isSelected ? "text-white" : "text-gray-300"
                        )}>
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </div>
                    </div>
                    
                    {/* Selected Indicator */}
                    {isSelected && (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </div>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Notes Section */}
          <div className="space-y-3">
            <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Notes
            </DropdownMenuLabel>
            <div className="relative">
              <GameNotes gameId={gameId} />
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
