import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchQuery, useStatusFilter } from "@/hooks/useGameFilters";

export function NoGamesFound() {
  const [searchQuery] = useSearchQuery();
  const [statusFilter] = useStatusFilter();

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No games found</h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery || statusFilter !== "all"
            ? "No games match your filters"
            : "Start building your game collection by adding games"}
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Game
        </Button>
      </CardContent>
    </Card>
  );
}