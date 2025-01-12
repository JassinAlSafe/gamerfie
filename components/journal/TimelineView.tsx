"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditIcon, Trash2Icon } from "lucide-react";
import type { JournalEntry } from "@/stores/useJournalStore";
import { useJournalStore } from "@/stores/useJournalStore";
import { EditEntryModal } from "./EditEntryModal";
import { DeleteEntryDialog } from "./DeleteEntryDialog";
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/image-utils";

interface TimelineViewProps {
  entries: JournalEntry[];
}

function formatDate(date: string) {
  return new Date(date)
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, ".");
}

function getEntryTitle(entry: JournalEntry) {
  if (entry.type === "list") return entry.title;
  if (entry.type === "progress") return `Progress Update: ${entry.game?.name}`;
  if (entry.type === "review") return `Game Review: ${entry.game?.name}`;
  if (entry.type === "daily") return "Daily Gaming Log";
  return "Journal Entry";
}

export function TimelineView({ entries }: TimelineViewProps) {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);
  const deleteEntry = useJournalStore((state) => state.deleteEntry);

  const handleDelete = () => {
    if (deletingEntry) {
      deleteEntry(deletingEntry.id);
      setDeletingEntry(null);
    }
  };

  return (
    <div className="space-y-12">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative">
          {/* Line connector */}
          {index !== entries.length - 1 && (
            <div className="absolute left-0 top-12 bottom-0 w-px bg-gray-800" />
          )}

          <div className="relative pl-8">
            {/* Date marker */}
            <div className="absolute left-0 top-2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-700" />

            <div className="flex items-baseline justify-between mb-4 gap-4">
              <h3 className="text-lg font-medium text-white">
                {getEntryTitle(entry)}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingEntry(entry)}
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingEntry(entry)}
                  className="h-8 w-8 text-gray-400 hover:text-red-400"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
                <time className="text-sm text-gray-500 tabular-nums">
                  {formatDate(entry.date)}
                </time>
              </div>
            </div>

            <div className="text-gray-400 space-y-6">
              {(entry.type === "progress" || entry.type === "review") &&
                entry.game && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <Image
                        src={
                          entry.game.cover_url
                            ? getCoverImageUrl(entry.game.cover_url)
                            : "/images/placeholders/game-cover.jpg"
                        }
                        alt={`Cover for ${entry.game.name}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        quality={90}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      {entry.type === "progress" && (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                                <div
                                  className="h-full bg-white rounded-full"
                                  style={{
                                    width: `${parseInt(
                                      entry.progress || "0"
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-white">
                              {parseInt(entry.progress || "0")}%
                            </span>
                          </div>
                          <p className="text-sm">
                            {entry.content ||
                              `Played for ${entry.hoursPlayed} hours`}
                          </p>
                        </>
                      )}
                      {entry.type === "review" && (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-6 rounded-sm ${
                                    i < (entry.rating || 0)
                                      ? "bg-white"
                                      : "bg-gray-800"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-white">
                              {entry.rating}/10
                            </span>
                          </div>
                          <p className="text-sm">{entry.content}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

              {entry.type === "daily" && (
                <p className="text-sm">{entry.content}</p>
              )}

              {entry.type === "list" && (
                <div>
                  <h4 className="font-medium text-white mb-3">{entry.title}</h4>
                  <div className="grid gap-2">
                    {JSON.parse(entry.content).map((game: any, i: number) => (
                      <div
                        key={game.id}
                        className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-md"
                      >
                        {game.cover_url && (
                          <div className="relative w-8 h-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={getCoverImageUrl(game.cover_url)}
                              alt={`Cover for ${game.name}`}
                              fill
                              className="object-cover"
                              sizes="32px"
                              quality={90}
                            />
                          </div>
                        )}
                        <span className="text-sm">
                          {i + 1}. {game.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {editingEntry && (
        <EditEntryModal
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
