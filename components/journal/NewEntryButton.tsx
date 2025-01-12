import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewEntryButtonProps {
  onClick: () => void;
}

export function NewEntryButton({ onClick }: NewEntryButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="bg-white hover:bg-gray-100 text-gray-900 gap-2 h-9 px-3 text-sm font-medium"
      size="sm"
    >
      <PlusIcon className="h-4 w-4" />
      New Entry
    </Button>
  );
}
