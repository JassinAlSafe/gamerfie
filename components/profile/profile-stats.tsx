import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/app/hooks/use-profile";

interface ProfileStatsProps {
  className?: string;
}

export function ProfileStats({ className }: ProfileStatsProps) {
  const { gameStats } = useProfile();

  return (
    <Card className={`bg-[#0f1116] border-gray-800/50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">
          Detailed Game Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Played</p>
            <p className="text-4xl font-bold text-purple-500">
              {gameStats.total_played}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Played This Year</p>
            <p className="text-4xl font-bold text-indigo-500">
              {gameStats.played_this_year}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Backlog</p>
            <p className="text-4xl font-bold text-pink-500">
              {gameStats.backlog}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Completion Rate</p>
            <p className="text-4xl font-bold text-green-500">
              {gameStats.total_played > 0
                ? `${(
                    (gameStats.total_played /
                      (gameStats.total_played + gameStats.backlog)) *
                    100
                  ).toFixed(1)}%`
                : "0%"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
