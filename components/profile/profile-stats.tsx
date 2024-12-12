import { GameStats } from "@/types/user";
import { Card } from "@/components/ui/card";
import { Trophy, Calendar, Clock } from "lucide-react";

interface ProfileStatsProps {
  stats: GameStats;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    {
      label: "Total Games Played",
      value: stats.total_played,
      icon: Trophy,
      color: "text-yellow-500"
    },
    {
      label: "Played This Year",
      value: stats.played_this_year,
      icon: Calendar,
      color: "text-blue-500"
    },
    {
      label: "Games in Backlog",
      value: stats.backlog,
      icon: Clock,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {statItems.map((item) => (
        <Card key={item.label} className="p-6 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <item.icon className={`w-8 h-8 ${item.color}`} />
            <div>
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
