import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface GamesErrorProps {
  error: Error | null;
  onReset: () => void;
}

export function GamesError({ error, onReset }: GamesErrorProps) {
  return (
    <div className="container py-8" role="alert" aria-live="assertive">
      <div className="max-w-md mx-auto p-6 bg-gray-900/80 border border-red-500/30 rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center gap-4">
          <AlertTriangle
            className="h-12 w-12 text-red-500"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-white">
            Error Loading Games
          </h2>
          <p className="text-gray-200 mb-4">
            {error?.message || "An unknown error occurred while loading games."}
          </p>
          <Button
            variant="outline"
            className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 hover:border-red-500/50 focus:ring-2 focus:ring-red-500/40 focus:outline-none"
            onClick={onReset}
            aria-label="Reset filters and try again"
          >
            Reset Filters & Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
