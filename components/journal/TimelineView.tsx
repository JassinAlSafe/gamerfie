"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import type { JournalEntry } from "@/stores/useJournalStore";
import { useJournalStore } from "@/stores/useJournalStore";
import { JournalEntryDialog } from "./JournalEntryDialog";
import { DeleteEntryDialog } from "./DeleteEntryDialog";
import Image from "next/image";
import { format } from "date-fns";
import {
  BarChart2,
  Calendar,
  Star,
  BookOpen,
  MoreVertical,
  Edit2,
  Clock,
  GamepadIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface TimelineViewProps {
  entries: JournalEntry[];
}

export function TimelineView({ entries }: TimelineViewProps) {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);
  const deleteEntry = useJournalStore((state) => state.deleteEntry);

  const handleDelete = async () => {
    if (deletingEntry) {
      await deleteEntry(deletingEntry.id);
      setDeletingEntry(null);
    }
  };

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, JournalEntry[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedEntries).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  // Update the entry card rendering with improved styling
  function renderEntryCard(entry: JournalEntry, index: number) {
    // Get entry type color
    const getEntryTypeColor = (type: string) => {
      switch (type) {
        case "progress":
          return "from-emerald-500/20 to-teal-500/10 border-emerald-500/20";
        case "review":
          return "from-amber-500/20 to-yellow-500/10 border-amber-500/20";
        case "daily":
          return "from-blue-500/20 to-indigo-500/10 border-blue-500/20";
        case "list":
          return "from-purple-500/20 to-violet-500/10 border-purple-500/20";
        default:
          return "from-gray-500/20 to-gray-600/10 border-gray-500/20";
      }
    };

    // Get entry type icon
    const getEntryTypeIcon = (type: string) => {
      switch (type) {
        case "progress":
          return <BarChart2 className="h-4 w-4 text-emerald-400" />;
        case "review":
          return <Star className="h-4 w-4 text-amber-400" />;
        case "daily":
          return <Calendar className="h-4 w-4 text-blue-400" />;
        case "list":
          return <BookOpen className="h-4 w-4 text-purple-400" />;
        default:
          return <GamepadIcon className="h-4 w-4 text-gray-400" />;
      }
    };

    return (
      <motion.div
        key={entry.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${getEntryTypeColor(
          entry.type
        )} border backdrop-blur-sm shadow-lg`}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:8px_8px] opacity-30" />

        <div className="relative p-4">
          {/* Header with type badge and date */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`px-2 py-0.5 bg-background/40 backdrop-blur-sm font-medium flex items-center gap-1.5 ${
                  entry.type === "progress"
                    ? "text-emerald-400 border-emerald-500/30"
                    : entry.type === "review"
                    ? "text-amber-400 border-amber-500/30"
                    : entry.type === "daily"
                    ? "text-blue-400 border-blue-500/30"
                    : entry.type === "list"
                    ? "text-purple-400 border-purple-500/30"
                    : "text-gray-400 border-gray-500/30"
                }`}
              >
                {getEntryTypeIcon(entry.type)}
                {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
              </Badge>
              <span className="text-sm text-gray-400">
                {formatDate(entry.date)}
              </span>
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-gray-900/95 backdrop-blur-md border border-gray-800"
              >
                <DropdownMenuItem
                  onClick={() => {
                    setEditingEntry(entry);
                  }}
                  className="text-gray-300 hover:text-white focus:text-white cursor-pointer"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingEntry(entry);
                  }}
                  className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer"
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Entry content based on type */}
          {entry.type === "progress" && (
            <div className="space-y-3">
              {entry.game && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-emerald-500/20 shadow-inner">
                  {entry.game.cover_url && (
                    <div className="relative h-14 w-10 rounded-md overflow-hidden flex-shrink-0 shadow-md ring-1 ring-white/10">
                      <Image
                        src={entry.game.cover_url}
                        alt={entry.game.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-white text-lg">
                      {entry.game.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5">
                      {entry.hoursPlayed !== undefined && (
                        <span className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full text-emerald-300">
                          <Clock className="h-3 w-3" />
                          {entry.hoursPlayed} hrs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {entry.progress !== undefined && (
                <div className="space-y-1.5 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-emerald-500/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Completion</span>
                    <span className="text-emerald-300 font-medium">
                      {entry.progress}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-800/80 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-in-out"
                      style={{ width: `${entry.progress}%` }}
                    >
                      <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%)] bg-[length:4px_4px]" />
                    </div>
                  </div>
                </div>
              )}

              {entry.content && (
                <div className="mt-3 text-gray-200 whitespace-pre-wrap bg-background/40 backdrop-blur-sm p-3 rounded-lg border border-emerald-500/20">
                  {entry.content}
                </div>
              )}
            </div>
          )}

          {entry.type === "review" && (
            <div className="space-y-3">
              {entry.game && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-amber-500/20 shadow-inner">
                  {entry.game.cover_url && (
                    <div className="relative h-14 w-10 rounded-md overflow-hidden flex-shrink-0 shadow-md ring-1 ring-white/10">
                      <Image
                        src={entry.game.cover_url}
                        alt={entry.game.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-white text-lg">
                      {entry.game.name}
                    </div>
                    {entry.rating !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {[0, 1, 2, 3, 4].map((i) => {
                            const rating = entry.rating || 0;
                            return (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(rating / 2)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-600"
                                }`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-sm text-yellow-400 font-medium ml-1">
                          {entry.rating}/10
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {entry.content && (
                <div className="mt-2 text-gray-200 whitespace-pre-wrap bg-background/40 backdrop-blur-sm p-3 rounded-lg border border-amber-500/20">
                  {entry.content}
                </div>
              )}
            </div>
          )}

          {entry.type === "daily" && (
            <div className="space-y-3">
              {entry.game && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-blue-500/20 shadow-inner">
                  {entry.game.cover_url && (
                    <div className="relative h-14 w-10 rounded-md overflow-hidden flex-shrink-0 shadow-md ring-1 ring-white/10">
                      <Image
                        src={entry.game.cover_url}
                        alt={entry.game.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-white text-lg">
                      {entry.game.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5">
                      {entry.hoursPlayed !== undefined && (
                        <span className="flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full text-blue-300">
                          <Clock className="h-3 w-3" />
                          {entry.hoursPlayed} hrs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {entry.content && (
                <div className="mt-2 text-gray-200 whitespace-pre-wrap bg-background/40 backdrop-blur-sm p-3 rounded-lg border border-blue-500/20">
                  {entry.content}
                </div>
              )}
            </div>
          )}

          {entry.type === "list" && (
            <div className="space-y-3">
              {entry.title && (
                <div className="font-medium text-white text-lg bg-background/40 backdrop-blur-sm p-3 rounded-lg border border-purple-500/20">
                  {entry.title}
                </div>
              )}

              {/* For list type, content is a JSON string of games */}
              {(() => {
                let content;
                try {
                  const games = JSON.parse(entry.content || "[]");
                  if (Array.isArray(games) && games.length > 0) {
                    content = (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {games.map((game, index) => (
                          <div
                            key={game.id || index}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-purple-500/20 shadow-inner"
                          >
                            {game.cover_url && (
                              <div className="relative h-14 w-10 rounded-md overflow-hidden flex-shrink-0 shadow-md ring-1 ring-white/10">
                                <Image
                                  src={game.cover_url}
                                  alt={game.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                  unoptimized
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white truncate flex items-center gap-2">
                                <span className="flex items-center justify-center bg-purple-500/20 text-purple-300 w-5 h-5 rounded-full text-xs font-bold">
                                  {index + 1}
                                </span>
                                <span className="truncate">{game.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    content = (
                      <div className="text-gray-200 whitespace-pre-wrap bg-background/40 backdrop-blur-sm p-3 rounded-lg border border-purple-500/20">
                        {entry.content}
                      </div>
                    );
                  }
                } catch (_e) {
                  // If parsing fails, just show the content as text
                  content = (
                    <div className="text-gray-200 whitespace-pre-wrap bg-background/40 backdrop-blur-sm p-3 rounded-lg border border-purple-500/20">
                      {entry.content}
                    </div>
                  );
                }
                return content;
              })()}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.length > 0 ? (
        sortedDates.map((date) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm py-3 px-2 rounded-lg shadow-md">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-white">
                  {formatDate(date)}
                </h3>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent mt-3"></div>
            </div>

            <div className="space-y-4">
              {groupedEntries[date].map((entry, index) =>
                renderEntryCard(entry, index)
              )}
            </div>
          </div>
        ))
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-xl" />
            <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-6 border border-purple-500/20 shadow-xl">
              <BookOpen className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No Journal Entries Yet
          </h3>
          <p className="text-gray-400 max-w-md mb-6">
            Start documenting your gaming journey by creating your first journal
            entry. Track your progress, write reviews, or just log your daily
            gaming sessions.
          </p>
          <Button
            onClick={() => {
              // Find the NewEntryButton and trigger a click
              const newEntryButton = document.querySelector(
                '[data-new-entry-button="true"]'
              );
              if (newEntryButton) {
                (newEntryButton as HTMLButtonElement).click();
              }
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Create Your First Entry
          </Button>
        </motion.div>
      )}

      {editingEntry && (
        <JournalEntryDialog
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          entry={editingEntry}
        />
      )}

      <DeleteEntryDialog
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
