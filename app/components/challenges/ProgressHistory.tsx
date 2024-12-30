import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface ProgressHistoryEntry {
  timestamp: string;
  goal_id: string;
  progress: number;
  milestone?: string;
}

interface ProgressHistoryProps {
  challengeId: string;
  goalId?: string;
}

export default function ProgressHistory({
  challengeId,
  goalId,
}: ProgressHistoryProps) {
  const [history, setHistory] = useState<ProgressHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `/api/challenges/${challengeId}/progress/history${
            goalId ? `?goalId=${goalId}` : ""
          }`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch progress history");
        }

        const data = await response.json();
        setHistory(data.history);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [challengeId, goalId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
  }

  const chartData = history.map((entry) => ({
    ...entry,
    date: format(new Date(entry.timestamp), "MMM d, yyyy"),
    formattedProgress: Math.round(entry.progress),
  }));

  const milestones = history.filter((entry) => entry.milestone);

  return (
    <div className="space-y-6">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={60}
              interval="preserveStartEnd"
            />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Progress"]}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="formattedProgress"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {milestones.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Milestones</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="p-4 bg-indigo-50 rounded-lg border border-indigo-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(milestone.timestamp), "MMM d, yyyy")}
                    </p>
                    <p className="font-medium">
                      {milestone.milestone
                        ?.replace("_", " ")
                        .replace("percent", "%")}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round(milestone.progress)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
