import { GameCard } from '../game-card';
import { Game, GameStatus } from '@/types';
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
          status={game.status || "want_to_play"}
          isPriority={index < 4}
          onStatusChange={(status: GameStatus) => mutations.updateGameStatus.mutate({ gameId: game.id, status })}
          onRemove={() => mutations.removeFromLibrary.mutate(game.id)}
          onReviewUpdate={(rating: number, reviewText: string) =>
            mutations.updateReview.mutate({ gameId: game.id, review: reviewText, rating })
          }
        />
      ))}
    </div>
  );
}