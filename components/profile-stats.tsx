'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { useQuery } from "@tanstack/react-query";  // Update import
import { supabase } from "@/utils/supabase-client";

interface GameStats {
  total_played: number;
  played_this_year: number;
  backlog: number;
}

const calculateGameStats = (games: any[]): GameStats => {
  const currentYear = new Date().getFullYear();
  
  return {
    total_played: games.filter(game => game.status === 'completed').length,
    played_this_year: games.filter(game => 
      game.status === 'completed' && 
      new Date(game.updated_at).getFullYear() === currentYear
    ).length,
    backlog: games.filter(game => game.status === 'want_to_play').length
  };
};

export function ProfileStats() {
  const { data: gameStats = { total_played: 0, played_this_year: 0, backlog: 0 }, isLoading } = useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: games, error } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return calculateGameStats(games || []);
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    suspense: true,
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-10 bg-muted animate-pulse rounded-md w-16" />
                  <div className="h-4 bg-muted animate-pulse rounded-md w-24" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold">
              {gameStats.total_played}
            </CardTitle>
            <CardDescription>Total Games Played</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold">
              {gameStats.played_this_year}
            </CardTitle>
            <CardDescription>Played in {new Date().getFullYear()}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold">
              {gameStats.backlog}
            </CardTitle>
            <CardDescription>Games Backlogged</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}