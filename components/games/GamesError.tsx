import { Button } from "@/components/ui/button";

interface GamesErrorProps {
  error: Error | null;
  onReset: () => void;
}

export function GamesError({ error, onReset }: GamesErrorProps) {
  return (
    <div className="container py-8">
      <div className="text-center text-red-500">
        <p>Error loading games: {error?.message || "Unknown error"}</p>
        <Button variant="outline" className="mt-4" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
