import { GameDetails } from "@/components/game-details";
import { GameService } from "@/services/gameService";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const game = await GameService.fetchGameById(parseInt(params.id));
    return {
      title: game ? `${game.name} | Gamerfie` : "Game Details",
      description: game?.summary || "View game details",
    };
  } catch (error) {
    return {
      title: "Game Details | Gamerfie",
      description: "View game details",
    };
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  try {
    const game = await GameService.fetchGameById(parseInt(params.id));

    if (!game) {
      notFound();
    }

    return <GameDetails game={game} />;
  } catch (error) {
    console.error("Error fetching game details:", error);
    return <ErrorState error={error as Error} />;
  }
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-2xl font-bold text-red-500">
        Error: {error.message}
      </div>
    </div>
  );
}
