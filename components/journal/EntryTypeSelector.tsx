import { Button } from "@/components/ui/button";
import type { JournalEntryType } from "@/stores/useJournalStore";

const entryTypes = [
  {
    id: "progress" as JournalEntryType,
    label: "Progress Update",
    description: "Log your progress for a specific game.",
  },
  {
    id: "daily" as JournalEntryType,
    label: "Daily Log",
    description: "Write about your overall gaming day or week.",
  },
  {
    id: "review" as JournalEntryType,
    label: "Review",
    description: "Review a game you've recently played.",
  },
  {
    id: "list" as JournalEntryType,
    label: "Custom List",
    description: "Create a personalized list (e.g., Top 10 RPGs).",
  },
];

interface EntryTypeSelectorProps {
  onSelect: (type: JournalEntryType) => void;
}

export function EntryTypeSelector({ onSelect }: EntryTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {entryTypes.map((type) => (
        <Button
          key={type.id}
          onClick={() => onSelect(type.id)}
          variant="outline"
          className="flex flex-col items-start p-4 h-auto bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600"
        >
          <span className="font-bold text-white">{type.label}</span>
          <span className="text-sm text-gray-400">{type.description}</span>
        </Button>
      ))}
    </div>
  );
}
