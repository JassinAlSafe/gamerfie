import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";

interface GamesSectionProps {
  totalGames: number;
}

export const GamesSection: React.FC<GamesSectionProps> = ({ totalGames }) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-white">Games</CardTitle>
        <Link href="/profile/games">
          <Button
            variant="link"
            className="text-purple-400 hover:text-purple-300"
          >
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <Gamepad2 className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-gray-300">Total Games</span>
          </div>
          <span className="text-xl font-bold text-white">
            {totalGames}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};