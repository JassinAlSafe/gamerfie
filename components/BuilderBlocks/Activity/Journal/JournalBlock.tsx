"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { Block } from "../../Block";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Star,
  Trophy,
  BarChart3,
  ListTodo,
  PenLine,
  Loader2,
} from "lucide-react";
import {
  useJournalStore,
  JournalEntry,
  JournalEntryType,
} from "@/stores/useJournalStore";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JournalBlockProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const journalTypeIcons: Record<JournalEntryType, React.ReactNode> = {
  progress: <BarChart3 className="h-4 w-4 text-blue-500" />,
  review: <Star className="h-4 w-4 text-amber-500" />,
  daily: <PenLine className="h-4 w-4 text-purple-500" />,
  list: <ListTodo className="h-4 w-4 text-indigo-500" />,
  note: <PenLine className="h-4 w-4 text-emerald-500" />,
  achievement: <Trophy className="h-4 w-4 text-yellow-500" />,
};

const journalTypeColors: Record<JournalEntryType, string> = {
  progress: "text-blue-500",
  review: "text-amber-500",
  daily: "text-purple-500",
  list: "text-indigo-500",
  note: "text-emerald-500",
  achievement: "text-yellow-500",
};

const MAX_CHARS = 500;
const ENTRY_TYPES = [
  { value: "daily", label: "Daily Log", icon: <PenLine className="h-4 w-4" /> },
  {
    value: "progress",
    label: "Progress Update",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  { value: "review", label: "Game Review", icon: <Star className="h-4 w-4" /> },
  {
    value: "achievement",
    label: "Achievement",
    icon: <Trophy className="h-4 w-4" />,
  },
  { value: "list", label: "List", icon: <ListTodo className="h-4 w-4" /> },
  { value: "note", label: "Quick Note", icon: <PenLine className="h-4 w-4" /> },
];

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const firstLine = entry.content?.split("\n")[0];
  const remainingContent = entry.content?.split("\n").slice(1).join("\n");
  const shouldShowTitle = entry.title && entry.title !== firstLine;

  return (
    <div className="flex items-start gap-4 p-3">
      <div className="relative mt-1">
        {entry.game?.cover_url ? (
          <Avatar className="h-10 w-10 ring-2 ring-indigo-500/20">
            <AvatarImage src={entry.game.cover_url} />
            <AvatarFallback className="bg-accent">
              {entry.game.name[0]}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center">
            {journalTypeIcons[entry.type]}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium truncate text-foreground">
            {shouldShowTitle ? entry.title : firstLine}
          </h4>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(entry.createdAt))} ago
          </span>
        </div>

        {entry.game && (
          <p className="text-sm text-muted-foreground truncate">
            {entry.game.name}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm">
          <span
            className={cn(
              "flex items-center gap-1.5",
              journalTypeColors[entry.type]
            )}
          >
            {journalTypeIcons[entry.type]}
            <span className="capitalize">{entry.type}</span>
          </span>
          {entry.rating && (
            <span className="flex items-center gap-1.5 text-amber-500">
              <Star className="h-3 w-3" />
              {entry.rating}/10
            </span>
          )}
          {entry.progress && (
            <span className="flex items-center gap-1.5 text-blue-500">
              <BarChart3 className="h-3 w-3" />
              {entry.progress}%
            </span>
          )}
        </div>

        {remainingContent && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {remainingContent}
          </p>
        )}
      </div>
    </div>
  );
}

function JournalInput() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addEntry } = useJournalStore();

  // Auto-focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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
        icon: "✍️",
        style: {
          background: "#1a1b1e",
          color: "#fff",
          border: "1px solid rgba(147, 51, 234, 0.1)",
        },
      });
      textareaRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = content.length;
  const remaining = MAX_CHARS - charCount;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 min-h-0 relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your daily journal entry..."
          className={cn(
            "absolute inset-0 resize-none transition-colors",
            "scrollbar-thin scrollbar-thumb-indigo-500/10 scrollbar-track-transparent",
            "focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/20",
            isOverLimit &&
              "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
          )}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-4 text-xs">
          <span
            className={cn(
              "text-muted-foreground/50",
              isOverLimit && "text-red-500"
            )}
          >
            {remaining} characters remaining
          </span>
          <span className="text-muted-foreground/50">
            Press ⌘/Ctrl + Enter to submit
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end mt-3 gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting || isOverLimit}
          className={cn(
            "transition-all duration-200",
            isSubmitting ? "w-[40px]" : "w-[100px]",
            "bg-indigo-500 hover:bg-indigo-600"
          )}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Add Entry"
          )}
        </Button>
      </div>
    </div>
  );
}

function LatestEntry() {
  const { entries, loading } = useJournalStore();

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 h-full">
        <p className="text-sm text-muted-foreground">No entries yet</p>
      </div>
    );
  }

  const latestEntry = entries[0];
  return <JournalEntryCard entry={latestEntry} />;
}

export function JournalBlock({ size = "sm", className }: JournalBlockProps) {
  const { fetchEntries } = useJournalStore();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return (
    <Block
      size={size}
      variant="ghost"
      hover={false}
      glassmorphism={false}
      className={cn(
        "h-[360px] rounded-xl border shadow-sm border-indigo-200/10",
        "bg-gradient-to-b from-indigo-500/5 via-indigo-500/2 to-background",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-indigo-200/10">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <h3 className="text-lg font-semibold bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Journal
            </h3>
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-[3] min-h-0">
            <JournalInput />
          </div>
          <div className="flex-1 min-h-0 border-t border-indigo-200/10 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/10 scrollbar-track-transparent">
            <LatestEntry />
          </div>
        </div>
      </div>
    </Block>
  );
}
