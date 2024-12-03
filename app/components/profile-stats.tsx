import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase-client"; // Adjust the import according to your project structure

export function ProfileStats() {
  const { data: gameStats = { total_played: 0, played_this_year: 0, backlog: 0 }, isLoading } = useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // Fetch game stats logic here
      return { total_played: 10, played_this_year: 5, backlog: 3 }; // Example data
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Game Stats</h2>
      <p>Total Played: {gameStats.total_played}</p>
      <p>Played This Year: {gameStats.played_this_year}</p>
      <p>Backlog: {gameStats.backlog}</p>
    </div>
  );
}