import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
interface StatsSectionProps {
  stats: any | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ 
  stats, 
  isLoading: _isLoading, 
  onRefresh 
}) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Advanced Statistics
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="text-blue-400 hover:text-blue-300"
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Games:</span>
                <span className="text-white font-medium">
                  {stats.total_games}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Completed:</span>
                <span className="text-white font-medium">
                  {stats.completed_games}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Rating:</span>
                <span className="text-white font-medium">
                  {stats.avg_rating?.toFixed(1) || "0.0"}⭐
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Playtime:</span>
                <span className="text-white font-medium">
                  {Math.round(stats.total_playtime || 0)}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Journal Entries:</span>
                <span className="text-white font-medium">
                  {stats.journal?.total_entries || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Reviews:</span>
                <span className="text-white font-medium">
                  {stats.journal?.total_reviews || 0}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            Loading advanced statistics...
          </div>
        )}
      </CardContent>
    </Card>
  );
};