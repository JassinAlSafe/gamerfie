import { GameCard } from '../game-card';
import { Game, GameStatus } from '@/types';  // Add GameStatus import
import { GameMutationHandlers } from '@/types/game';

interface GamesListProps {
  games: Game[];
  mutations: GameMutationHandlers;
}

export function GamesList({ games, mutations }: GamesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          {...game}
          isPriority={index < 4}
          onStatusChange={(status: GameStatus) => mutations.updateGameStatus(game.id, status)}
          onRemove={() => mutations.removeFromLibrary(game.id)}
          onReviewUpdate={(rating: number, reviewText: string) =>
            mutations.updateReview(game.id, rating, reviewText)
          }
        />
      ))}
    </div>
  );
}