import { GameCard } from "../game-card";
import { Game, GameStatus } from "@/types/game";
import { useGameMutations } from "@/hooks/useGameMutations";

interface GamesListProps {
  games: Game[];
  mutations: ReturnType<typeof useGameMutations>;
}

export function GamesList({ games, mutations }: GamesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          id={game.game_id}
          name={game.name || "Unknown Game"}
          cover={game.cover}
          platforms={game.platforms}
          status={game.status as GameStatus}
          summary={game.summary}
          total_rating={game.total_rating}
          isPriority={index < 4}
          onStatusChange={(status) =>
            mutations.updateGameStatus({ gameId: game.game_id, status })
          }
          onRemove={() => mutations.removeFromLibrary(game.game_id)}
        />
      ))}
    </div>
  );
}
