"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Game } from "@/types/game";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { GridGameCard, ListGameCard } from "./game-cards";

interface SortableGameCardProps {
  game: Game;
  view: 'grid' | 'list';
}

export function SortableGameCard({ game, view }: SortableGameCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "z-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-move bg-gray-900/80 rounded-full p-1"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      {view === 'grid' ? (
        <GridGameCard game={game} />
      ) : (
        <ListGameCard game={game} />
      )}
    </div>
  );
} 