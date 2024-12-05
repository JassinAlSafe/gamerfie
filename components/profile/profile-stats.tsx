import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/app/hooks/use-profile";

interface ProfileStatsProps {
  className?: string;
}

export function ProfileStats({ className }: ProfileStatsProps) {
  const { gameStats } = useProfile();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Game Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Total Played</p>
            <p className="text-2xl font-bold">{gameStats.total_played}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Played This Year</p>
            <p className="text-2xl font-bold">{gameStats.played_this_year}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Backlog</p>
            <p className="text-2xl font-bold">{gameStats.backlog}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
