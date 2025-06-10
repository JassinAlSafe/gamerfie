import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewEntryButtonProps {
  onClick: () => void;
}

export function NewEntryButton({ onClick }: NewEntryButtonProps) {
  return (
    <Button
      onClick={onClick}
      data-new-entry-button="true"
      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white gap-2 h-9 px-4 text-sm font-medium shadow-lg shadow-purple-500/20 transition-all duration-200 hover:shadow-purple-500/30"
      size="sm"
    >
      <BookOpen className="h-4 w-4" />
      New Entry
    </Button>
  );
}
