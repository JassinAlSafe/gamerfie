"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { Block } from "../../Block";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Star,
  ListTodo,
  Loader2,
  LineChart,
  Plus,
  Edit3,
  Heart,
  Sparkles,
} from "lucide-react";
import {
  useJournalStore,
  JournalEntry,
  JournalEntryType,
} from "@/stores/useJournalStore";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/text/textarea";

import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface JournalBlockProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Harmonious color palette based on our theme
const journalTypeIcons: Record<JournalEntryType, React.ReactNode> = {
  progress: <LineChart className="h-4 w-4 text-blue-400" />,
  review: <Star className="h-4 w-4 text-amber-400" />,
  daily: <Edit3 className="h-4 w-4 text-purple-400" />,
  list: <ListTodo className="h-4 w-4 text-indigo-400" />,
  note: <Heart className="h-4 w-4 text-rose-400" />,
  achievement: <Sparkles className="h-4 w-4 text-emerald-400" />,
};

const journalTypeColors: Record<JournalEntryType, string> = {
  progress: "text-blue-400",
  review: "text-amber-400",
  daily: "text-purple-400",
  list: "text-indigo-400",
  note: "text-rose-400",
  achievement: "text-emerald-400",
};

const journalTypeBgs: Record<JournalEntryType, string> = {
  progress: "bg-blue-500/10 border-blue-500/20",
  review: "bg-amber-500/10 border-amber-500/20",
  daily: "bg-purple-500/10 border-purple-500/20",
  list: "bg-indigo-500/10 border-indigo-500/20",
  note: "bg-rose-500/10 border-rose-500/20",
  achievement: "bg-emerald-500/10 border-emerald-500/20",
};

const MAX_CHARS = 500;

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const firstLine = entry.content?.split("\n")[0];
  const remainingContent = entry.content?.split("\n").slice(1).join("\n");
  const shouldShowTitle = entry.title && entry.title !== firstLine;

  return (
    <div className="group relative p-4 hover:bg-muted/20 transition-all duration-200 border-l-2 border-transparent hover:border-purple-400/30">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {entry.game?.cover_url ? (
            <Avatar className="h-10 w-10 ring-2 ring-purple-500/20 ring-offset-2 ring-offset-background group-hover:ring-purple-500/40 transition-all duration-200">
              <AvatarImage src={entry.game.cover_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                {entry.game.name[0]}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className={cn(
                "h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-200 group-hover:scale-105",
                journalTypeBgs[entry.type]
              )}
            >
              {journalTypeIcons[entry.type]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-foreground group-hover:text-purple-400 transition-colors duration-200 line-clamp-2">
              {shouldShowTitle ? entry.title : firstLine}
            </h4>
            <span className="text-xs text-muted-foreground/70 flex-shrink-0 mt-0.5">
              {formatDistanceToNow(new Date(entry.createdAt))} ago
            </span>
          </div>

          {entry.game && (
            <p className="text-xs text-muted-foreground/80 truncate flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 bg-purple-400 rounded-full" />
              {entry.game.name}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
                journalTypeBgs[entry.type],
                journalTypeColors[entry.type]
              )}
            >
              {journalTypeIcons[entry.type]}
              <span className="capitalize">{entry.type}</span>
            </span>

            {entry.rating && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Star className="h-3 w-3" />
                {entry.rating}/10
              </span>
            )}

            {entry.progress && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <LineChart className="h-3 w-3" />
                {entry.progress}%
              </span>
            )}
          </div>

          {remainingContent && (
            <p className="text-xs text-muted-foreground/70 line-clamp-2 break-words leading-relaxed">
              {remainingContent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function JournalInput() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addEntry } = useJournalStore();

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || content.length > MAX_CHARS) return;

    setIsSubmitting(true);
    try {
      await addEntry({
        content,
        type: "daily",
        title: content.split("\n")[0].slice(0, 50),
        date: new Date().toISOString().split("T")[0],
      });
      setContent("");
      toast.success("Entry added successfully", {
        icon: "✨",
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: "1px solid rgba(147, 51, 234, 0.2)",
        },
      });
      textareaRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const hasContent = content.trim().length > 0;

  return (
    <div className="h-full flex flex-col p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isFocused
                ? "bg-purple-500/20 border border-purple-500/30"
                : "bg-muted/30 border border-transparent"
            )}
          >
            <Edit3
              className={cn(
                "h-4 w-4 transition-colors duration-200",
                isFocused ? "text-purple-400" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Quick Entry</h4>
            <p className="text-xs text-muted-foreground">
              Share your gaming thoughts
            </p>
          </div>
        </div>

        {hasContent && (
          <div
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium transition-all duration-200",
              isOverLimit
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : "bg-purple-500/10 border border-purple-500/20 text-purple-400"
            )}
          >
            {charCount}/{MAX_CHARS}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-1 min-h-0 relative">
        <div
          className={cn(
            "absolute inset-0 rounded-xl border-2 transition-all duration-200",
            isFocused
              ? "border-purple-500/30 bg-purple-500/5"
              : "border-border/30 bg-muted/20",
            isOverLimit && "border-red-500/30 bg-red-500/5"
          )}
        >
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What's on your mind about gaming today?\n\nShare a thought, achievement, or reflection..."
            className="absolute inset-0 resize-none border-0 bg-transparent focus:ring-0 placeholder:text-muted-foreground/50 text-sm leading-relaxed p-4"
          />

          {/* Floating action area */}
          <div
            className={cn(
              "absolute bottom-3 right-3 flex items-center gap-2 transition-all duration-200",
              isFocused || hasContent ? "opacity-100" : "opacity-0"
            )}
          >
            {!hasContent && (
              <span className="text-xs text-muted-foreground/60 hidden sm:block">
                ⌘/Ctrl + Enter to submit
              </span>
            )}

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting || isOverLimit}
              className={cn(
                "transition-all duration-300 shadow-lg",
                isSubmitting
                  ? "w-9 h-9 p-0"
                  : hasContent
                  ? "bg-purple-600 hover:bg-purple-700 border-purple-500/20"
                  : "bg-muted hover:bg-muted/80",
                hasContent && "ring-2 ring-purple-500/20"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasContent ? (
                <Plus className="h-4 w-4" />
              ) : (
                <Edit3 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LatestEntry() {
  const { entries, loading } = useJournalStore();

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-full text-center space-y-3">
        <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20">
          <BookOpen className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No entries yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start writing about your gaming journey
          </p>
        </div>
      </div>
    );
  }

  const latestEntry = entries[0];
  return (
    <div className="space-y-2">
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs font-medium text-purple-400">
            Latest Entry
          </span>
        </div>
      </div>
      <JournalEntryCard entry={latestEntry} />
    </div>
  );
}

export function JournalBlock({ size = "sm", className }: JournalBlockProps) {
  useEffect(() => {
    // Use direct store access to avoid dependency issues
    useJournalStore.getState().fetchEntries();
  }, []); // Removed fetchEntries from dependencies

  return (
    <Block
      size={size}
      variant="ghost"
      hover={true}
      glassmorphism={false}
      className={cn(
        "min-h-0 w-full h-full rounded-2xl border shadow-sm border-purple-200/20",
        "bg-gradient-to-br from-purple-500/5 via-purple-500/3 to-card/80 backdrop-blur-sm",
        "flex flex-col group",
        "hover:border-purple-300/30 hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-purple-200/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors duration-200">
              <BookOpen className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Gaming Journal
              </h3>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-[2.5] min-h-0 overflow-hidden">
            <JournalInput />
          </div>
          <div className="flex-[1.5] min-h-0 border-t border-purple-200/10 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/10 scrollbar-track-transparent hover:scrollbar-thumb-purple-500/20">
            <LatestEntry />
          </div>
        </div>
      </div>
    </Block>
  );
}
