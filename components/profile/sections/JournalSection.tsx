import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText } from "lucide-react";
import Link from "next/link";
import type { JournalEntry } from "@/types/journal";
import { formatDisplayDate } from "@/utils/date-formatting";

interface JournalSectionProps {
  entries: JournalEntry[];
}

export const JournalSection: React.FC<JournalSectionProps> = ({ entries }) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <BookText className="h-5 w-5 text-green-400" />
          Journal
        </CardTitle>
        <Link
          href="/profile/journal"
          className="text-sm text-green-400 hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="border-b border-gray-800 pb-3 last:border-0"
              >
                <p className="font-medium text-white">
                  {entry.title}
                </p>
                <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                  {entry.content}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {formatDisplayDate(entry.createdAt)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                    {entry.type === "progress" && "Progress"}
                    {entry.type === "review" && "Review"}
                    {entry.type === "daily" && "Daily"}
                    {entry.type === "list" && "List"}
                    {entry.type === "note" && "Note"}
                    {entry.type === "achievement" && "Achievement"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">
            No journal entries yet. Start journaling to see entries here!
          </p>
        )}
      </CardContent>
    </Card>
  );
};