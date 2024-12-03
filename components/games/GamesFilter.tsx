import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchQuery, useStatusFilter } from "@/hooks/useGameFilters";

export function GamesFilter() {
  const [searchQuery, setSearchQuery] = useSearchQuery();
  const [statusFilter, setStatusFilter] = useStatusFilter();

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex-1 w-full md:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="playing">Playing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="want_to_play">Want to Play</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Game
        </Button>
      </div>
    </div>
  );
}